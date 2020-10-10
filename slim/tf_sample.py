import tensorflow as tf

from tensorflow.examples.tutorials.mnist import input_data
mnist = input_data.read_data_sets('MNIST_data', one_hot=True)

x  = tf.placeholder(tf.float32, shape=[None, 784])
y_ = tf.placeholder(tf.float32, shape=[None, 10])

w1 = tf.get_variable("w1", shape=[784, 512], initializer=tf.contrib.layers.xavier_initializer())
b1 = tf.Variable(tf.zeros([512], dtype=tf.float32))
w2 = tf.Variable(tf.zeros([512, 10], dtype=tf.float32))
b2 = tf.Variable(tf.zeros([10], dtype=tf.float32))

h = tf.nn.relu(tf.matmul(x, w1) + b1)
y = tf.matmul(h, w2) + b2

cross_entropy = tf.nn.sigmoid_cross_entropy_with_logits(labels=y_, logits=y)
train_step = tf.train.AdamOptimizer().minimize(cross_entropy)

with tf.Session() as sess:

    sess.run(tf.initialize_all_variables())
    start = time.time()

    for i in range(20000):
        batch = mnist.train.next_batch(50)
        train_step.run(feed_dict={x: batch[0], y_: batch[1]})

