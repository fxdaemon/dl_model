"""Export model given existing training checkpoints.

The model is exported as SavedModel with proper signatures that can be loaded by
standard tensorflow_model_server.
"""

import os.path
import tensorflow as tf
from nets import nets_factory

slim = tf.contrib.slim

tf.app.flags.DEFINE_string('model_name', 'resnet_v2_50', 
                          """The name of the architecture to evaluate.""")
tf.app.flags.DEFINE_string('checkpoint_dir', None,
                           """Directory where to read training checkpoints.""")
tf.app.flags.DEFINE_string('output_dir', 'output',
                           """Directory where to export inference model.""")
tf.app.flags.DEFINE_integer('model_version', 1,
                            """Version number of the model.""")
tf.app.flags.DEFINE_float('moving_average_decay', None,
                          'The decay to use for the moving average.'
                          'If left as None, then moving averages are not used.')
tf.app.flags.DEFINE_integer('image_height', 224, '')
tf.app.flags.DEFINE_integer('image_width', 224, '')
tf.app.flags.DEFINE_integer('num_classes', 7, '')

FLAGS = tf.app.flags.FLAGS


def export():

  with tf.Graph().as_default():
    # Build inference model.
    # Please refer to model for details.
    network_fn = nets_factory.get_network_fn(
        FLAGS.model_name, num_classes=FLAGS.num_classes, is_training=False)
    image_height = FLAGS.image_height or network_fn.default_image_size
    image_width = FLAGS.image_width or network_fn.default_image_size
    input = tf.placeholder(name='input', dtype=tf.float32,
                          shape=[None, image_height, image_width, 1])
    # input = tf.reshape(input, [1, image_height, image_width, 1])
    logits, _ = network_fn(input)

    # Transform output to topK result.
    values, indices = tf.nn.top_k(logits, FLAGS.num_classes)

    # Restore variables from training checkpoint.
    if FLAGS.moving_average_decay:
      variable_averages = tf.train.ExponentialMovingAverage(FLAGS.moving_average_decay)
      variables_to_restore = variable_averages.variables_to_restore(slim.get_model_variables())
    else:
      variables_to_restore = slim.get_variables_to_restore()
    saver = tf.train.Saver(variables_to_restore)
    
    with tf.Session() as sess:
      # Restore variables from training checkpoints.
      ckpt = tf.train.get_checkpoint_state(FLAGS.checkpoint_dir)
      if ckpt and ckpt.model_checkpoint_path:
        saver.restore(sess, ckpt.model_checkpoint_path)
        # Assuming model_checkpoint_path looks something like:
        #   /my-favorite-path/imagenet_train/model.ckpt-0,
        # extract global_step from it.
        global_step = ckpt.model_checkpoint_path.split('/')[-1].split('-')[-1]
        print('Successfully loaded model from %s at step=%s.' % (ckpt.model_checkpoint_path, global_step))
      else:
        print('No checkpoint file found at %s' % FLAGS.checkpoint_dir)
        return

      # Export inference model.
      output_path = os.path.join(
        tf.compat.as_bytes(FLAGS.output_dir),
          tf.compat.as_bytes(str(FLAGS.model_version)))
      print('Exporting trained model to', output_path)
      builder = tf.saved_model.builder.SavedModelBuilder(output_path)

      # Build the signature_def_map.
      classify_inputs_tensor_info = tf.saved_model.utils.build_tensor_info(input)
      scores_output_tensor_info = tf.saved_model.utils.build_tensor_info(values)
      indices_output_tensor_info = tf.saved_model.utils.build_tensor_info(indices)
  
      classification_signature = (
        tf.saved_model.signature_def_utils.build_signature_def(
          inputs={
            'inputs': classify_inputs_tensor_info
          },
          outputs={
            'indices': indices_output_tensor_info,
            'scores': scores_output_tensor_info
          },
          method_name="tensorflow/serving/classify"))

      builder.add_meta_graph_and_variables(
          sess, [tf.saved_model.tag_constants.SERVING],
          signature_def_map={
            'serving_default': classification_signature
          },
          legacy_init_op=tf.group(tf.tables_initializer(), name='legacy_init_op'))

      builder.save()
      print('Successfully exported model to %s' % FLAGS.output_dir)


def main(unused_argv=None):
  export()


if __name__ == '__main__':
  tf.app.run()