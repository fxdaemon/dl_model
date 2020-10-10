# dl_model
Optimize strategies with CNN models of deep learning. 
Please install [FXDaemon](http://www.fxdaemon.com) before you start.

#### 1. Create signals with technical indicators.

```bash
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_signal' 'out/1.signal/' 'EUR/JPY' 'm15' '2016-1-16 4:0:0' '2018-3-31 4:15:0'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_signal' 'out/1.signal/' 'EUR/USD' 'm15' '2016-1-16 4:0:0' '2018-3-31 4:15:0'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_signal' 'out/1.signal/' 'USD/JPY' 'm15' '2016-1-16 4:0:0' '2018-3-31 4:15:0'
```

#### 2. Create labels by profit and loss in 3 steps.

* STEP1
```bash
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s1' 'out/2.label/' 'EUR/JPY' 'm15' '2016-1-16 4:0:0' '2018-3-31 4:15:0' '1'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s1' 'out/2.label/' 'EUR/USD' 'm15' '2016-1-16 4:0:0' '2018-3-31 4:15:0' '1'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s1' 'out/2.label/' 'USD/JPY' 'm15' '2016-1-16 4:0:0' '2018-3-31 4:15:0' '1'
```

* STEP2
```bash
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s2' 'out/2.label/EUR-JPY/m15.s1.csv' 'EUR/JPY' 'm15' '90' '100' '288'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s2' 'out/2.label/EUR-USD/m15.s1.csv' 'EUR/USD' 'm15' '90' '100' '288'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s2' 'out/2.label/USD-JPY/m15.s1.csv' 'USD/JPY' 'm15' '90' '100' '288'
```

* STEP3
```bash
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s3' 'out/2.label/EUR-JPY/m15.s2.p90_100.t288.csv' 'EUR/JPY' 'm15'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s3' 'out/2.label/EUR-USD/m15.s2.p90_100.t288.csv' 'EUR/USD' 'm15'
$ fxTrade --ini=fxTrade-mk.ini -j 'mk_label_s3' 'out/2.label/USD-JPY/m15.s2.p90_100.t288.csv' 'USD/JPY' 'm15'
```
#### 3. Create TFRecords.

```bash
$ export cur_dir=$(cd $(dirname $0);pwd)
$ pushd slim

# EUR/JPY
$ python3 -u download_and_convert_data.py \
  --dataset_name=fxtrade \
  --signal_dir=${cur_dir}/out/1.signal/EUR-JPY \
  --label_dir=${cur_dir}/out/2.label/EUR-JPY \
  --label_files=m15.s3.p90_100.t288.csv \
  --dataset_dir=${cur_dir}/out/3.tfrecord/ej.m15.t288 \
  --symbol=ej \
  --periods=m15 \
  --draw_signals="price_open,price_close,price_high,price_low,macd_macd,macd_signal,macd_hist,stoch_slowk,stoch_slowd" \
  --label_offset=1 \
  --image_size=224,224

# EUR/USD
$ python3 -u download_and_convert_data.py \
  --dataset_name=fxtrade \
  --signal_dir=${cur_dir}/out/1.signal/EUR-USD \
  --label_dir=${cur_dir}/out/2.label/EUR-USD \
  --label_files=m15.s3.p90_100.t288.csv \
  --dataset_dir=${cur_dir}/out/3.tfrecord/eu.m15.t288 \
  --symbol=eu \
  --periods=m15 \
  --draw_signals="price_open,price_close,price_high,price_low,macd_macd,macd_signal,macd_hist,stoch_slowk,stoch_slowd" \
  --label_offset=1 \
  --image_size=224,224

# USD/JPY
$ python3 -u download_and_convert_data.py \
  --dataset_name=fxtrade \
  --signal_dir=${cur_dir}/out/1.signal/USD-JPY \
  --label_dir=${cur_dir}/out/2.label/USD-JPY \
  --label_files=m15.s3.p90_100.t288.csv \
  --dataset_dir=${cur_dir}/out/3.tfrecord/uj.m15.t288 \
  --symbol=uj \
  --periods=m15 \
  --draw_signals="price_open,price_close,price_high,price_low,macd_macd,macd_signal,macd_hist,stoch_slowk,stoch_slowd" \
  --label_offset=1 \
  --image_size=224,224

# Put EUR/JPY, EUR/USD, USD/JPY together in one place
$ pushd $cur_dir/out/3.tfrecord
$ mkdir a3.m15.t288
$ cd a3.m15.t288
$ ln -s $cur_dir/out/3.tfrecord/ej.m15.t288/fxtrade_train_ej_m15_001-of-003.tfrecord fxtrade_train_ej_m15_001-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/ej.m15.t288/fxtrade_train_ej_m15_002-of-003.tfrecord fxtrade_train_ej_m15_002-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/ej.m15.t288/fxtrade_train_ej_m15_003-of-003.tfrecord fxtrade_train_ej_m15_003-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/eu.m15.t288/fxtrade_train_eu_m15_001-of-003.tfrecord fxtrade_train_eu_m15_001-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/eu.m15.t288/fxtrade_train_eu_m15_002-of-003.tfrecord fxtrade_train_eu_m15_002-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/eu.m15.t288/fxtrade_train_eu_m15_003-of-003.tfrecord fxtrade_train_eu_m15_003-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/uj.m15.t288/fxtrade_train_uj_m15_001-of-003.tfrecord fxtrade_train_uj_m15_001-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/uj.m15.t288/fxtrade_train_uj_m15_002-of-003.tfrecord fxtrade_train_uj_m15_002-of-003.tfrecord
$ ln -s $cur_dir/out/3.tfrecord/uj.m15.t288/fxtrade_train_uj_m15_003-of-003.tfrecord fxtrade_train_uj_m15_003-of-003.tfrecord
```

#### 4. Train 2 epochs.

```bash
$ popd
$ python3 -u train_image_classifier.py \
  --dataset_name=fxtrade \
  --dataset_dir=${cur_dir}/out/3.tfrecord/a3.m15.t288 \
  --dataset_pattern=fxtrade_%s_*.tfrecord \
  --labels_offset=0 \
  --model_name=resnet_v2_50 \
  --train_dir=${cur_dir}/out/checkpoint/m15.p90_100.t288.b32 \
  --checkpoint_path= \
  --learning_rate=0.01 \
  --learning_rate_decay_factor=0.94 \
  --num_epochs_per_decay=2 \
  --moving_average_decay=0.9999 \
  --label_smoothing=0 \
  --optimizer=adam \
  --ignore_missing_vars=True \
  --batch_size=32 \
  --image_height=224 \
  --image_width=224 \
  --num_classes=3 \
  --num_samples=145081 \
  --num_labels=1 \
  --max_number_of_steps=`expr 145081 \* 2 / 32` \
  --skip_preprocess=True
```

#### 5. Save trained models to graph.

```bash
$ python3 -u export_inference_graph.py \
  --model_name=resnet_v2_50 \
  --output_file=${cur_dir}/out/graph/m15.p90_100.t288.b32.pb \
  --dataset_name=fxtrade \
  --dataset_dir=${cur_dir}/out/3.tfrecord/a3.m15.t288 \
  --image_height=224 \
  --image_width=224 \
  --num_classes=3

$ NEWEST_CHECKPOINT=$(ls -t1 ${cur_dir}/out/checkpoint/m15.p90_100.t288.b32/model.ckpt*| head -n1)
$ NEWEST_CHECKPOINT=${NEWEST_CHECKPOINT%.*}

$ python3 -u /usr/local/lib/python3.6/site-packages/tensorflow/python/tools/freeze_graph.py \
  --input_graph=${cur_dir}/out/graph/m15.p90_100.t288.b32.pb \
  --input_checkpoint=$NEWEST_CHECKPOINT \
  --output_graph=${cur_dir}/out/graph/m15.p90_100.t288.b32_freeze.pb \
  --input_binary=True \
  --output_node_name=resnet_v2_50/predictions/Reshape_1
```

#### 6. Run back testing.

```bash
$ pushd
$ fxTrade -s --ini=fxTrade-bktest-dl.ini
```
