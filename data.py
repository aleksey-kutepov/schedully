#!/usr/bin/env python2
# -*- coding: utf-8 -*-
from __future__ import unicode_literals, print_function
import json

TARGET = "src/app/components/schedulesData/data.js"

schedules = [
    {
        "from": "m-gork",
        "to": "m-mosk",
        "times": """
5:31, 5:43, 5:50, 6:05, 6:18, 6:32, 6:44, 6:54, 7:03, 7:09, 7:15, 7:21, 7:27, 7:33, 7:39, 7:45, 7:52, 7:58, 8:04, 8:10, 8:16, 8:22, 8:28, 8:34, 8:40, 8:46, 8:52, 8:58, 9:04, 9:10, 9:16, 9:22, 9:28, 9:34, 9:40, 9:46, 9:52, 10:04, 10:16, 10:28, 10:40, 10:52,  11:04, 11:16, 11:28, 11:40, 11:52, 12:04, 12:16, 12:28, 12:40, 12:52, 13:04, 13:16, 13:28, 13:40, 13:52, 14:04, 14:16, 14:28, 14:40, 14:52, 15:04, 15:16, 15:25, 15:31, 15:37, 15:43, 15:49, 15:55, 16:01, 16:07, 16:13, 16:19, 16:25, 16:31, 16:37, 16:43, 16:49, 16:55, 17:01, 17:07, 17:13, 17:19,  17:25, 17:31, 17:37, 17:43, 17:49, 17:55, 18:01, 18:07, 18:13, 18:19, 18:25, 18:31, 18:37, 18:43, 18:49, 18:55, 19:01, 19:07, 19:13, 19:19, 19:25, 19:31, 19:37, 19:43, 19:49, 19:55, 20:01, 20:07, 20:13, 20:25, 20:37, 20:49, 21:01, 21:13, 21:25, 21:37, 21:51, 22:05, 22:17, 22:31, 22:53, 23:17, 23:40, 00:15
"""
    },
    {
        "from": "m-mosk",
        "to": "m-gork",
        "times": """
5:20, 5:30, 5:41, 5:56, 6:09, 6:23, 6:35, 6:45, 6:54, 7:00, 7:06, 7:12, 7:18, 7:24, 7:30, 7:36, 7:43, 7:49, 7:55, 8:01, 8:07, 8:13, 8:19, 8:24, 8:31, 8:37, 8:43, 8:49, 8:55, 9:01, 9:07, 9:13, 9:19, 9:25, 9:31, 9:37, 9:43, 9:55, 10:07, 10:19, 10:31, 10:43, 10:55, 11:07, 11:19, 11:31, 11:43, 11:55, 12:07, 12:19, 12:31, 12:43, 12:55, 13:07, 13:19, 13:31, 13:43, 13:55, 14:07, 14:19, 14:31, 14:43, 14:55, 15:07, 15:16, 15:22, 15:28, 15:34, 15:40, 15:46, 15:52, 15:58, 16:04, 16:10, 16:16, 16:22, 16:28, 16:34, 16:40, 16:46, 16:52, 16:58, 17:04, 17:10, 17:16, 17:22, 17:28, 17:34, 17:40, 17:46, 17:52, 17:58, 18:04, 18:10, 18:16, 18:22, 18:28, 18:34, 18:40, 18:46, 18:52, 18:58, 19:04, 19:10, 19:16, 19:22, 19:28, 19:34, 19:40, 19:46, 19:52, 19:58, 20:04, 20:16, 20:28, 20:40, 20:52, 21:04, 21:16, 21:28, 21:40, 21:52, 22:04, 22:22, 22:39, 23:05, 23:28, 23:55, 00:16, 00:48
"""
    },
]

locations = [
    {
        "id": "m-gork",
        "type": "metro",
        "places": [
            {
                "name": "Вход с ул. Горького",
                "location": {"latitude": 56.314362, "longitude": 43.994766},
            }
        ],
        "name": 'Метро "Горьковская"',
    },
    {
        "id": "m-mosk",
        "type": "metro",
        "places": [
            {
                "name": "Вход с Вокзала",
                "location": {"latitude": 56.321376, "longitude": 43.945503},
            }
        ],
        "name": 'Метро "Московская"',
    }
]


def main():
    for entry in schedules:
        times = entry["times"].replace("\n", " ").replace(": ", ":")
        times = [x.strip() for x in times.split(",")]
        times = [list(map(int, x.split(":"))) for x in times]
        entry["times"] = times


    data = "window.APP_DB = {}".format(
        json.dumps({"schedules": schedules, "locations": locations})
    )
    with open(TARGET, "w") as fp:
        fp.write(data)

if __name__ == "__main__":
    main()
