import json
from io import BytesIO
from PIL import Image
import os
import tempfile

import boto3
from botocore import UNSIGNED
from botocore.client import Config

import streamlit as st
import pandas as pd
import numpy as np

from src.resnet_model import ResnetModel
from ultralytics import YOLO

import cv2
import matplotlib.pyplot as plt

def load_model(path: str = "utils/runs/detect/train2/weights/best4.pt") -> ResnetModel:
    model = YOLO(path, "v8")
    return model

def load_index_to_label_dict(path: str = "utils/class_label.json") -> dict:
    with open(path, "r") as f:
        index_to_class_label_dict = json.load(f)
    index_to_class_label_dict = {
        int(k): v for k, v in index_to_class_label_dict.items()
    }
    return index_to_class_label_dict

def load_files_from_s3(keys: list, bucket_name: str = "bird-classification-bucket") -> list:
    """Retrieves files from S3 bucket"""
    s3 = boto3.client("s3")
    s3_files = []
    for key in keys:
        s3_file_raw = s3.get_object(Bucket=bucket_name, Key=key)
        s3_file_cleaned = s3_file_raw["Body"].read()
        s3_file_image = Image.open(BytesIO(s3_file_cleaned))
        s3_files.append(s3_file_image)
    return s3_files

def load_s3_file_structure(path: str = "src/all_image_files.json") -> dict:
    """Retrieves JSON document outlining the S3 file structure"""
    with open(path, "r") as f:
        return json.load(f)

def load_list_of_images_available(all_image_files: dict, image_files_dtype: str, bird_species: str) -> list:
    species_dict = all_image_files.get(image_files_dtype)
    return species_dict.get(bird_species, [])

def predict(model, img, conf_rate) -> list:
    """Make predictions using the YOLO model."""
    formatted_predictions = model.predict(source=[img], conf=conf_rate, save=False)
    return formatted_predictions

def image_annotation(detect_params, frame, class_list, detection_colors, slot_numbers):
    """Annotate the image with bounding boxes and class labels."""
    total_detections = len(detect_params[0]) if len(detect_params[0]) != 0 else 1
    if total_detections != 0:
        for i in range(len(detect_params[0])):
            boxes = detect_params[0].boxes
            box = boxes[i]
            clsID = box.cls.numpy()[0]
            conf = box.conf.numpy()[0]
            bb = box.xyxy.numpy()[0]
            class_name = class_list[int(clsID)]
            slot_number = i + 1

            cv2.rectangle(
                frame,
                (int(bb[0]), int(bb[1])),
                (int(bb[2]), int(bb[3])),
                detection_colors[int(clsID)],
                3,
            )

            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.9
            cv2.putText(
                frame,
                f"{slot_number}",
                (int(bb[0]), int(bb[1]) - 5),
                font,
                font_scale,
                (255, 255, 255),
                2,
            )
    return frame

def cal_classes_counts(total_detections: int, detect_params, class_list: dict) -> tuple:
    """Calculate the count of each class detected."""
    class_counts = {value: 0 for value in class_list.values()}
    slot_numbers = {}
    if total_detections != 0:
        for i in range(len(detect_params[0])):
            boxes = detect_params[0].boxes
            box = boxes[i]
            clsID = box.cls.numpy()[0]
            class_name = class_list[int(clsID)]
            class_counts[class_name] += 1
            slot_numbers[i + 1] = int(clsID)  # Assign slot numbers starting from 1
    return class_counts, slot_numbers

def cal_classes_percentage(total_detections: int, class_counts: dict) -> dict:
    """Calculate the percentage of each class detected."""
    class_percentages = {
        class_name: count / total_detections * 100
        for class_name, count in class_counts.items()
    }
    for class_name, percentage in class_percentages.items():
        print(f"Percentage of {class_name}: {percentage:.2f}%")
    return class_percentages

def save_image(image, image_name: str, output_path: str):
    """Save the processed image to the specified path."""
    output_directory = os.path.dirname(output_path)
    os.makedirs(output_directory, exist_ok=True)

    valid_extensions = [".jpg", ".jpeg", ".png"]
    ext = os.path.splitext(output_path)[1].lower()
    if ext not in valid_extensions:
        output_path = os.path.splitext(output_path)[0] + image_name

    cv2.imwrite(output_path, image)

    if os.path.exists(output_path):
        print(f"Image saved successfully to: {output_path}")
    else:
        print("Failed to save the image.")