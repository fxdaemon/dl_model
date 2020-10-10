# ================================================
# Copyright (c) 2020 FXDaemon All Rights Reserved.
# ================================================

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import sys
import glob
import math
import random
import gzip
import datetime
import numpy as np
from operator import itemgetter
import tensorflow as tf

from datasets import dataset_utils

_IMAGE_SIZE = 224
_MIDDLE_LINE = int(_IMAGE_SIZE / 2) #112
_PRICE_BASE_LINE = 100 + 2          #102
_STOCH_BASE_LINE = _IMAGE_SIZE - 2  #222

_GRAY_SCALE_255 = 255
_GRAY_SCALE_S = 224
_GRAY_SCALE_S1 = 192
_GRAY_SCALE_S2 = 160
_GRAY_SCALE_S3 = 128
_GRAY_SCALE_S4 = 96
_GRAY_SCALE_M = 64
_GRAY_SCALE_L = 32

_NUM_CHANNELS = 1
_RANDOM_SEED = None
_DELIMIT = ','
_NUM_SIGFILE_PER_TFR = 24

_PRICE, _MACD, _STOCH = range(3)
_SIG_TYPE = [_PRICE, _PRICE, _PRICE, _PRICE, \
    _MACD, _MACD, _MACD, _STOCH, _STOCH]
_SIG_GRAY_SCALE = [
  [_GRAY_SCALE_S1, _GRAY_SCALE_S2, _GRAY_SCALE_S3, _GRAY_SCALE_S4,
    _GRAY_SCALE_S, _GRAY_SCALE_S, _GRAY_SCALE_S, _GRAY_SCALE_S, _GRAY_SCALE_S],
  [_GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M,
    _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M, _GRAY_SCALE_M],
  [_GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L,
    _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L, _GRAY_SCALE_L]]
SIG_TEXT = ['price_open', 'price_close', 'price_high', 'price_low', \
    'macd_macd', 'macd_signal', 'macd_hist', 'stoch_slowk', 'stoch_slowd']

timestamp_format = '%Y%m%d%H%M%S'


class SignalReader(object):

  def __init__(self):
    self.signals = []
    self.year = 0

  @staticmethod
  def read_signal(signal_path):
    """Read all signals from file
    return:
      [["20040105060000", "106.89,106.96, ...", ...], ...]
    """
    row, signals = -1, []
    for line in open(signal_path, "r"):
      line = line.rstrip('\n')
      if _DELIMIT in line:
        signals[row].append(line) # singal
      else:
        row = row + 1
        signals.append([line])    # timestamp
    return signals

  @staticmethod
  def get_signal_by_label(signal_dir, file_lst, labels, label, size):
    """Read signal from file list on condition of label & size
    return:
      [["20040105060000", "106.89,106.96, ...", ...], ...]
    """
    signals = []
    for f in file_lst:
      sig = SignalReader.read_signal(os.path.join(signal_dir, f))
      for s in sig:
        timestamp = s[0]
        if timestamp in labels:
          if labels[timestamp] == label:
            signals.append(s)
        else:
          print("[WARN] [%s] have no label." % (timestamp))
        if len(signals) == size:
          yield signals
          signals = []
    else:
      yield signals

  def load_signal(self, signal_dir, year):
    """Read signal from file of the year
    return:
      [["20040105060000", "106.89,106.96, ...", ...], ...]
    """
    if year == self.year:
      return self.signals
    self.signals = []
    self.year = year
    self.pos = 0
    for f in glob.glob(os.path.join(signal_dir, year + '*')):
      self.signals.extend(SignalReader.read_signal(f))
    return self.signals

  def find_signal(self, timestamp):
    """Get signal (single) of specified timestamp
    return:
      ["20040105060000", "106.89,106.96, ...", ...]
    """
    sig_size = len(self.signals)
    for i in range(0, sig_size - 1):
      cur = datetime.datetime.strptime(self.signals[i][0], timestamp_format)
      next = datetime.datetime.strptime(self.signals[i+1][0], timestamp_format)
      if timestamp >= cur and timestamp < next:
        self.pos = i
        return self.signals[i]
    if sig_size > 0:
      self.pos = sig_size - 1
      last = datetime.datetime.strptime(self.signals[self.pos][0], timestamp_format)
      if timestamp >= last:
        return self.signals[self.pos]
    return []

#---------------------------------------------------------------------------------------

def _get_signal_filenames(signal_dir):
  filenames = []
  for f in os.listdir(signal_dir):
    filenames.append(f)

  _years = set()
  for f in filenames:
    _years.add(f[:4])
  years = [x for x in sorted(_years)]
  last_year = years[-1]

  train_filenames = []
  test_filenames = []
  for f in filenames:
    if f[:4] == last_year:
      test_filenames.append(f)
    else:
      train_filenames.append(f)

  return train_filenames, test_filenames


def _read_label(label_dir, label_files, label_offset):
  """
  return:
    ・label_offset = '1'-'6'  ==> signal-label classification
      labels: {"20040105060000":["0"], "20040105060500":["2"], ...}
      lbl_nums: {"1":49051, "0":862068, "2":57725, ...}
    ・label_offset = '1,2,3' ==> signal-label classification
      labels: {"20040105060000":["0"], "20040105060500":["2"], ...}
      lbl_nums: {"1":49051, "0":862068, "2":57725, ...}
  """
  labels, lbl_nums = {}, {}
  offset = [int(i) for i in label_offset.split(_DELIMIT)]
  for f in label_files:
    for line in open(os.path.join(label_dir, f), "r"):
      line = line.rstrip('\n')
      items = line.split(" ")
      timestamp = items[0]
      if len(offset) == 1:
        # label_offset = '1'-'6'
        lbl = items[offset[0]]
      else:
        # label_offset = '1,2,3'
        lbl = '0'
        for i in range(len(offset)):
          l = int(items[offset[i]])
          if l > 0:
            lbl = str(i * 2 + l)
            break
      # Set the acquired label
      if lbl in lbl_nums:
        lbl_nums[lbl] += 1
      else:
        lbl_nums[lbl] = 1
      if timestamp in labels:
        labels[timestamp] += [lbl]
      else:
        labels[timestamp] = [lbl]
  
  # Consistency chec
  label_count = 0
  for k, v in labels.items():
    if label_count != 0 and len(v) != label_count:
      print("[ERROR] length of [%s] is not match. %d != %d" % (k, label_count, len(v)))
      labels, lbl_nums = {}, {}
      break
    else:
      label_count = len(v)
  
  for k in lbl_nums.keys():
    lbl_nums[k] = lbl_nums[k] // len(label_files)
  return labels, lbl_nums


# Standardize X  to range [0, multiple]
def _std_linear_p(lst, multiple):
  if len(lst) == 0:
    return []
  s_max = np.max(lst)
  s_min = np.min(lst)
  return np.multiply(np.divide(np.subtract(lst, s_min), s_max - s_min), multiple)


# Standardize X  to range [-multiple/2, multiple/2]
def _std_linear_mp(lst, multiple):
  if len(lst) == 0:
    return []
  s_max = np.max(lst)
  s_min = np.min(lst)
  abs_max = abs(s_max) if abs(s_max) >= abs(s_min) else abs(s_min)
  return np.multiply(np.divide(np.subtract(lst, 0), abs_max), multiple / 2)


def get_draw_flags(draw_singals):
  """
  args:
    "price_close,price_high,price_low,ema_1,ema_2,sma,macd_macd,macd_signal,macd_hist,stoch_slowk,stoch_slowd"

  return:
    [True, True, ...]
  """
  draw_flags = [False] * len(_SIG_TYPE)
  _draw_singals = draw_singals.split(_DELIMIT)
  for draw_signal in _draw_singals:
    idx = SIG_TEXT.index(draw_signal)
    draw_flags[idx] = True
  return draw_flags


def save_img(img_path, img_dat):
  with open(img_path, 'wb') as f:
    f.write(img_dat)


def sig2png(signal_path, out_dir, draw_singals, image_height, image_width):
  draw_flags = get_draw_flags(draw_singals)
  signals = SignalReader.read_signal(signal_path)
  with tf.Graph().as_default():
    image = tf.placeholder(dtype=tf.uint8, shape=(image_height, image_width, _NUM_CHANNELS))
    encoded_png = tf.image.encode_png(image)
    with tf.Session('') as sess:
      for sig in signals[:]:
        timestamp, img = _draw_bitmap([], sig, draw_flags, _SIG_GRAY_SCALE[0], image_height, image_width, True)
        png_string = sess.run(encoded_png, feed_dict={image: img})
        save_img(os.path.join(out_dir, timestamp + '.png'), png_string)


def _draw_bitmap(canvas, signals, draw_flags, gray_scales, image_height, image_width, interpolation):
  if len(canvas) == 0:
    canvas = np.zeros((image_height, image_width), np.uint8)
   
  def draw(signal, base_line, sig_gray_scales, interpolation):
    sig_idx = 0
    for sig in [signal[i:i+image_width] for i in range(0, len(signal), image_width)]:
      gray_scale = sig_gray_scales[sig_idx]
      sig_idx += 1
      for col in range(image_width):
        cur = int(base_line - round(sig[col]))
        canvas[cur][col] = gray_scale
        if col > 0 and interpolation:
          dif = cur - prev
          half = abs(dif // 2)
          for d in range(1, abs(dif)):
            v = prev + d * np.sign(dif)
            if d <= half:
              canvas[v][col - 1] = gray_scale
            else:
              canvas[v][col] = gray_scale
        prev = cur
  
  def get_gray_scales(signals_lst):
    pos = 0
    for s in signals_lst:
      count = len(s) // image_width
      yield sig_gray_scales[pos:pos+count]
      pos += count

  timestamp = signals[0]
  sig_gray_scales = []
  price, ema, sma, macd, stoch = [], [], [], [], []
  for i in range(len(signals) - 1):
    lst = [float(x) for x in signals[i+1].split(_DELIMIT)[image_width*-1:]]
    if draw_flags[i]:
      is_draw = True
      if _SIG_TYPE[i] == _PRICE:
        price.extend(lst)
      elif _SIG_TYPE[i] == _MACD:
        macd.extend(lst)
      elif _SIG_TYPE[i] == _STOCH:
        stoch.extend(lst)
      else:
        is_draw = False
      if is_draw:
        sig_gray_scales.append(gray_scales[i])

  len_price, len_ema = len(price), len(ema)
  price, ema, sma = np.split(_std_linear_p(np.r_[price, ema, sma], 100), [len_price, len_price + len_ema])
  macd = _std_linear_mp(macd, 100)
  p_get_gray_scales = get_gray_scales((price, ema, sma, macd, stoch))

  draw(price, _PRICE_BASE_LINE, next(p_get_gray_scales), False)
  draw(ema, _PRICE_BASE_LINE, next(p_get_gray_scales), interpolation)
  draw(sma, _PRICE_BASE_LINE, next(p_get_gray_scales), interpolation)
  #draw([0 for x in range(_IMAGE_SIZE)], _MIDDLE_LINE, [_GRAY_SCALE_S], False)
  draw(macd, _MIDDLE_LINE, next(p_get_gray_scales), interpolation)
  draw(stoch, _STOCH_BASE_LINE, next(p_get_gray_scales), interpolation)
  return timestamp, canvas


def _convert_bitmaps(signals, main_period, signal_dir, draw_flags_map, gray_scale_map, image_height, image_width, interpolation):
  signal_readers = {}
  bitmaps = []
  for sig in signals:
    timestamp, bitmap = _draw_bitmap([], sig, draw_flags_map[main_period], gray_scale_map[main_period], image_height, image_width, interpolation)
    dt = datetime.datetime.strptime(timestamp, timestamp_format)
    # Draw a signal for a period other than the main period
    success = True
    for period, draw_flags in draw_flags_map.items():
      if period != main_period:
        if not period in signal_readers:
          signal_readers[period] = SignalReader()
        signal_readers[period].load_signal(os.path.join(signal_dir, period), timestamp[:4])
        sig2 = signal_readers[period].find_signal(dt)
        if len(sig2) > 0:
          _, bitmap = _draw_bitmap(bitmap, sig2, draw_flags, gray_scale_map[period], image_height, image_width, interpolation)
        else:
          print('[ERROR] %s %s is not exist.' % (period, timestamp))
          success = False
    if success:
      bitmaps.append([timestamp, bitmap.reshape(image_height, image_width, _NUM_CHANNELS)])
  return bitmaps


def _add_to_tfrecord(dataset_path, bitmaps, labels, image_height, image_width, shuffle=True):
  print('>> Write TfRecord to %s.' % (dataset_path))
  count = 0
  if shuffle:
    bitmaps = random.sample(bitmaps, len(bitmaps))
  with tf.Graph().as_default():
    image = tf.placeholder(dtype=tf.uint8, shape=(image_height, image_width, _NUM_CHANNELS))
    encoded_png = tf.image.encode_png(image)
    with tf.Session('') as sess:
      with tf.python_io.TFRecordWriter(dataset_path) as tfrecord_writer:
        for timestamp, bitmap in bitmaps:
          if timestamp in labels:
            label = labels[timestamp]
            if isinstance(label, (tuple, list)):
              label = [int(l) for l in label]
            else:
              label = int(label)
            print(timestamp, label)
            png_string = sess.run(encoded_png, feed_dict={image: bitmap})
            example = dataset_utils.image_to_tfexample( \
              png_string, 'png'.encode(), image_height, image_width, label)
            tfrecord_writer.write(example.SerializeToString())
            count += 1
          else:
            print("[WARN] [%s] have no label." % (timestamp))
        else:
          save_img(os.path.join(os.path.dirname(dataset_path), timestamp + '.png'), png_string)
  return count


def run(signal_dir, label_dir, label_files, dataset_dir, symbol, periods, draw_singals, **options):
  """Runs conversion operation.
  Args:
    dataset_dir: The dataset directory where the dataset is stored.
  """
  if not tf.gfile.Exists(signal_dir):
    print('[ERROR] Signal directory is not exist.')
    return
  if not tf.gfile.Exists(os.path.dirname(label_dir)):
    print('[ERROR] Label directory is not exist.')
    return
  if not tf.gfile.Exists(dataset_dir):
    tf.gfile.MakeDirs(dataset_dir)

  # height, width
  image_height, image_width = options['image_size']

  # periods=m15,H1,H4  draw_singals=draw_s;draw_m;draw_l
  period_lst = periods.split(_DELIMIT)
  draw_singal_lst = draw_singals.split(';')
  if len(period_lst) != len(draw_singal_lst):
    print('[ERROR] peirod donot fit draw_singals.')
    return

  # main period: m15
  period = period_lst[0]

  # Generate train data file name list and test data file name list for main period
  train_filenames, test_filenames = _get_signal_filenames(os.path.join(signal_dir, period))
  print("train_file_count:%d test_file_count:%d" % (len(train_filenames), len(test_filenames)))
  random.seed(_RANDOM_SEED)

  # Generate signal drawing flag
  # {'m15':[True, ...], 'H1':[...], ...}
  draw_flags_map = {}
  for i in range(len(period_lst)):
    p = period_lst[i]
    draw_flags_map[p] = get_draw_flags(draw_singal_lst[i])
    print("[%s] draw_flags: " % (period_lst[i]), draw_flags_map[p])
  
  # Generate gray_scale information
  # {'m15':[_GRAY_SCALE_S1, ...], 'H1':[...], ...}
  gray_scale_map = {}
  for i in range(len(period_lst)):
    gray_scale_map[period_lst[i]] = _SIG_GRAY_SCALE[i]

  # Import label information
  label_offset = options['label_offset']
  label_files = label_files.split(_DELIMIT)
  labels, lbl_nums = _read_label(label_dir, label_files, label_offset)
  if len(labels) == 0:
    return
  for key, value in lbl_nums.items():
    print("label[%s]: %d" % (key, value))

  # train data
  interpolation = options['interpolation']
  train_count = 0
  tfr_num = math.ceil(len(train_filenames) / float(_NUM_SIGFILE_PER_TFR))
  for i in range(tfr_num):
    filenames = train_filenames[i*_NUM_SIGFILE_PER_TFR:(i+1)*_NUM_SIGFILE_PER_TFR]
    signals = []
    for f in filenames:
      sig = SignalReader.read_signal(os.path.join(signal_dir, period, f))
      signals.extend(sig)
    # Sorting in ascending order of time for efficient generation of multiple periods required for bitmap generation
    sorted(signals, key=lambda x: datetime.datetime.strptime(x[0], timestamp_format))

    # Create multiple bitmaps ==> {"20040105060000": [], ...}
    bitmaps = _convert_bitmaps(signals, period, signal_dir, draw_flags_map, gray_scale_map, image_height, image_width, interpolation)
    if len(bitmaps) == 0:
      break

    # create tf record
    tfr_filename = 'fxtrade_train_%s_%s_%03d-of-%03d.tfrecord' % (symbol, periods.replace(',',''), i+1, tfr_num)
    train_count += _add_to_tfrecord(os.path.join(dataset_dir, tfr_filename), bitmaps, labels, image_height, image_width)

  # test data
  test_count = 0
  tfr_num = math.ceil(len(test_filenames) / float(_NUM_SIGFILE_PER_TFR))
  for i in range(tfr_num):
    filenames = test_filenames[i*_NUM_SIGFILE_PER_TFR:(i+1)*_NUM_SIGFILE_PER_TFR]
    signals = []
    for f in filenames:
      sig = SignalReader.read_signal(os.path.join(signal_dir, period, f))
      signals.extend(sig)
    print('[test data] %d %s-%s' % (len(signals), signals[0][0], signals[-1][0]))
    
    # Create multiple bitmaps ==> {"20040105060000": [], ...}
    bitmaps = _convert_bitmaps(signals, period, signal_dir, draw_flags_map, gray_scale_map, image_height, image_width, interpolation)
    if len(bitmaps) == 0:
      break

    # create tf record
    tfr_filename = 'fxtrade_test_%s_%s_%03d-of-%03d.tfrecord' % (symbol, periods.replace(',',''), i+1, tfr_num)
    test_count += _add_to_tfrecord(os.path.join(dataset_dir, tfr_filename), bitmaps, labels, image_height, image_width, False)
  
  print('\nFinished converting the FXTrade dataset ==> [Train:%d Test:%d]' % (train_count, test_count))


if __name__ == "__main__":
  pass
