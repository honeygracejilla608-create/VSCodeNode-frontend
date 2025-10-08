#!/usr/bin/env python3
"""
GPU Test Script for AI Development Environment
Tests GPU availability and performance
"""

import torch
import tensorflow as tf
import time
import sys

def test_pytorch_gpu():
    """Test PyTorch GPU functionality"""
    print("🔥 Testing PyTorch GPU...")

    if torch.cuda.is_available():
        print(f"✅ CUDA Available: {torch.cuda.is_available()}")
        print(f"📊 GPU Count: {torch.cuda.device_count()}")
        print(f"🏷️  GPU Name: {torch.cuda.get_device_name(0)}")

        # Test GPU computation
        device = torch.device("cuda:0")
        x = torch.randn(1000, 1000).to(device)
        y = torch.randn(1000, 1000).to(device)

        start_time = time.time()
        z = torch.matmul(x, y)
        gpu_time = time.time() - start_time

        print(f"⚡ GPU Matrix Multiplication (1000x1000): {gpu_time".4f"}s")
        print(f"🧠 GPU Memory Allocated: {torch.cuda.memory_allocated(0) / 1024**2".2f"} MB")
        return True
    else:
        print("❌ CUDA not available")
        return False

def test_tensorflow_gpu():
    """Test TensorFlow GPU functionality"""
    print("\n🔥 Testing TensorFlow GPU...")

    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"✅ TensorFlow GPU Available: {len(gpus)} device(s)")
        for gpu in gpus:
            print(f"📊 GPU: {gpu}")

        # Test GPU computation
        with tf.device('/GPU:0'):
            a = tf.random.normal([1000, 1000])
            b = tf.random.normal([1000, 1000])

            start_time = time.time()
            c = tf.matmul(a, b)
            gpu_time = time.time() - start_time

        print(f"⚡ TensorFlow GPU Matrix Multiplication: {gpu_time".4f"}s")
        return True
    else:
        print("❌ TensorFlow GPU not available")
        return False

def test_memory_bandwidth():
    """Test GPU memory bandwidth"""
    print("\n🔥 Testing GPU Memory Bandwidth...")

    if torch.cuda.is_available():
        device = torch.device("cuda:0")

        # Test memory bandwidth
        sizes = [1000, 2000, 4000]
        for size in sizes:
            x = torch.randn(size, size).to(device)

            start_time = time.time()
            for _ in range(10):
                y = x + x
            torch.cuda.synchronize()
            elapsed = time.time() - start_time

            bandwidth = (x.numel() * x.element_size() * 20) / (elapsed * 1024**3)  # GB/s
            print(f"📊 Size {size}x{size}: {bandwidth".2f"} GB/s")

def main():
    print("🚀 AI GPU Development Environment Test")
    print("=" * 50)

    # Test PyTorch
    pytorch_gpu = test_pytorch_gpu()

    # Test TensorFlow
    tensorflow_gpu = test_tensorflow_gpu()

    # Test Memory Bandwidth
    if pytorch_gpu:
        test_memory_bandwidth()

    print("\n" + "=" * 50)
    if pytorch_gpu or tensorflow_gpu:
        print("✅ GPU acceleration is working!")
        print("🎯 Your AI development environment is ready!")
    else:
        print("⚠️  GPU acceleration not available")
        print("💡 Consider using CPU-only models or cloud GPU instances")

    return 0 if (pytorch_gpu or tensorflow_gpu) else 1

if __name__ == "__main__":
    sys.exit(main())
