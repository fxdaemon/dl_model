# Copyright 2016 The TensorFlow Authors. All Rights Reserved.
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
r"""Downloads and converts a particular dataset.

Usage:
```shell

$ python download_and_convert_data.py \
    --dataset_name=mnist \
    --dataset_dir=/tmp/mnist

$ python download_and_convert_data.py \
    --dataset_name=cifar10 \
    --dataset_dir=/tmp/cifar10

$ python download_and_convert_data.py \
    --dataset_name=flowers \
    --dataset_dir=/tmp/flowers

$ python download_and_convert_fxtrade.py \
    --dataset_name=fxtrade \
    --label_dir=/tmp/uj.csv
    --signal_dir/tmp/signal
    --dataset_dir=/tmp/tfrecord
    --symbol=uj
```
"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf

from datasets import download_and_convert_cifar10
from datasets import download_and_convert_flowers
from datasets import download_and_convert_mnist
from datasets import download_and_convert_fxtrade

FLAGS = tf.app.flags.FLAGS

tf.app.flags.DEFINE_string(
    'dataset_name',
    None,
    'The name of the dataset to convert, one of "cifar10", "flowers", "mnist", "fxtrade".')

tf.app.flags.DEFINE_string(
    'dataset_dir',
    None,
    'The directory where the output TFRecords and temporary files are saved.')

tf.app.flags.DEFINE_string('signal_dir', None, '')
tf.app.flags.DEFINE_string('label_dir', None, '')
tf.app.flags.DEFINE_string('label_files', '', '')
tf.app.flags.DEFINE_string('symbol', None, '')
tf.app.flags.DEFINE_string('periods', None, '')
tf.app.flags.DEFINE_boolean('sig2png', False, '')
tf.app.flags.DEFINE_string('signal_path', None, '')
tf.app.flags.DEFINE_string('out_dir', None, '')
tf.app.flags.DEFINE_string('draw_signals', ','.join(download_and_convert_fxtrade.SIG_TEXT), '')
tf.app.flags.DEFINE_string('label_offset', '1', '')
tf.app.flags.DEFINE_string('image_size', '224,224', 'height, width')
tf.app.flags.DEFINE_boolean('interpolation', True, '')

def main(_):
  if not FLAGS.dataset_name:
    raise ValueError('You must supply the dataset name with --dataset_name')
  if not FLAGS.dataset_dir:
    raise ValueError('You must supply the dataset directory with --dataset_dir')

  if FLAGS.dataset_name == 'cifar10':
    download_and_convert_cifar10.run(FLAGS.dataset_dir)
  elif FLAGS.dataset_name == 'flowers':
    download_and_convert_flowers.run(FLAGS.dataset_dir)
  elif FLAGS.dataset_name == 'mnist':
    download_and_convert_mnist.run(FLAGS.dataset_dir)
  elif FLAGS.dataset_name == 'fxtrade':
    if FLAGS.sig2png:
      download_and_convert_fxtrade.sig2png(FLAGS.signal_path, FLAGS.out_dir, FLAGS.draw)
    else:
      download_and_convert_fxtrade.run(FLAGS.signal_dir, FLAGS.label_dir, FLAGS.label_files,\
        FLAGS.dataset_dir, FLAGS.symbol, FLAGS.periods, FLAGS.draw_signals, \
        image_size = tuple([int(i) for i in FLAGS.image_size.split(",")]), \
        label_offset=FLAGS.label_offset, interpolation=FLAGS.interpolation)
  else:
    raise ValueError(
        'dataset_name [%s] was not recognized.' % FLAGS.dataset_name)

if __name__ == '__main__':
  tf.app.run()
