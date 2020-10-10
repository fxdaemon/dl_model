# Copyright 2015 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

"""Simple image classification with Inception.

Run image classification with Inception trained on ImageNet 2012 Challenge data
set.

This program creates a graph from a saved GraphDef protocol buffer,
and runs inference on an input JPEG image. It outputs human readable
strings of the top 5 predictions along with their probabilities.

Change the --image_file argument to any jpg image to compute a
classification of that image.

Please see the tutorial and website for a detailed description of how
to use this script to perform image recognition.

https://tensorflow.org/tutorials/image_recognition/
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import sys
import numpy as np
import tensorflow as tf


tf.app.flags.DEFINE_string(
  'model_file', '', 'Path to the .pb file that contains the frozen weights.')

tf.app.flags.DEFINE_string(
  'label_file', '', 'Absolute path to label file.')

tf.app.flags.DEFINE_string(
  'image_file', '', 'Absolute path to image file.')

tf.app.flags.DEFINE_integer(
  'image_height', 224, 'Height of input image size.')

tf.app.flags.DEFINE_integer(
  'image_width', 224, 'Widht of input image size.')

tf.app.flags.DEFINE_integer(
  'channels', 1, 'Channels of input image size.')

tf.app.flags.DEFINE_integer(
  'num_top_predictions', 5, 'Display this many predictions.')

tf.app.flags.DEFINE_string(
  'input_layer', 'input', 'Input layer in the graph.')

tf.app.flags.DEFINE_string(
  'output_layer', 'vgg_a/Predictions', 'Output layer in the graph.')

FLAGS = tf.app.flags.FLAGS


def load_graph(model_file):
  graph_def = tf.GraphDef()
  with open(model_file, "rb") as f:
    graph_def.ParseFromString(f.read())
  with tf.Graph().as_default() as g:
    tf.import_graph_def(graph_def)
  return g


def read_tensor_from_image_file(file_name, input_height, input_width, channels):
  input_name = "file_reader"
  output_name = "normalized"
  file_reader = tf.read_file(file_name, input_name)
  if file_name.endswith(".png"):
    image_reader = tf.image.decode_png(file_reader, channels = channels, name='png_reader')
  elif file_name.endswith(".gif"):
    image_reader = tf.squeeze(tf.image.decode_gif(file_reader, name='gif_reader'))
  #elif file_name.endswith(".bmp"):
  #  image_reader = tf.image.decode_bmp(file_reader, name='bmp_reader')
  else:
    image_reader = tf.image.decode_jpeg(file_reader, channels = channels, name='jpeg_reader')
  float_caster = tf.cast(image_reader, tf.float32)
  dims_expander = tf.expand_dims(float_caster, 0)
  resized = tf.image.resize_bilinear(dims_expander, [input_height, input_width])
  #normalized = tf.divide(tf.subtract(resized, [input_mean]), [input_std])
  sess = tf.Session()
  #result = sess.run(normalized)
  result = sess.run(resized)
  return result


def load_labels(label_file):
  label = []
  proto_as_ascii_lines = tf.gfile.GFile(label_file).readlines()
  for l in proto_as_ascii_lines:
    label.append(l.rstrip())
  return label


def main(_):
  if not tf.gfile.Exists(FLAGS.image_file):
    tf.logging.fatal('File does not exist %s', FLAGS.image_file)
  img = read_tensor_from_image_file(FLAGS.image_file, FLAGS.image_height, FLAGS.image_width, FLAGS.channels)

  # Creates graph from saved GraphDef.
  graph = load_graph(FLAGS.model_file)

  input_name = "import/" + FLAGS.input_layer
  output_name = "import/" + FLAGS.output_layer
  input_operation = graph.get_operation_by_name(input_name)
  output_operation = graph.get_operation_by_name(output_name)

  with tf.Session(graph=graph) as sess:
    predictions = sess.run(output_operation.outputs[0],
                      {input_operation.outputs[0]: img})
  predictions = np.squeeze(predictions)

  top_k = predictions.argsort()[-FLAGS.num_top_predictions:][::-1]
  labels = load_labels(FLAGS.label_file)
  for i in top_k:
    print(labels[i], predictions[i])

  return predictions, top_k


if __name__ == '__main__':
  tf.app.run()
  