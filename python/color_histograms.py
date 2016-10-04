# -*- coding: utf-8 -*-

"""
This script computes the mean color-histogram from all the paintings of the
dataset. It also computes the mean histogram for each genre, style and artist
sets from wikiart.org.
"""

import cv2
import json
import numpy as np
import multiprocessing
# from jsonpath import jsonpath
import requests
from urllib.parse import unquote
from urllib.request import urlopen

def make_histogram(colors):
    results = {}
    for color in colors:
        color_key = str(color[0])+","+str(color[1])+","+str(color[2])
        if color_key not in results:
            results[color_key] = 1
        else:
            results[color_key] += 1
    # filter out colors with only 1 pixel (usually around 50%) to save space
    # return {k:v for k, v in results.items() if v>1}
    return results

# http://stackoverflow.com/questions/15962119/using-bytearray-with-socket-recv-into
# http://stackoverflow.com/questions/24236271/what-can-i-do-to-improve-socket-performance-in-python-3
# http://stackoverflow.com/questions/33528959/downloading-images-with-gevent

def mp_worker(item):
    "compute the histogram from a painting url"
    # open painting from item url
    try:
        resp = urlopen(item["url"]+"!Blog.jpg").read()
    except:
        # try:
        resp = requests.get(item["url"]).content
        # resp = urlopen(item["url"])
        # except:
        #     print("ERROR URL with", repr(item["url"]))
        #     return({}, item["style"])
    # reshape it as flat RGB Uint8 bytes array
    img = np.asarray(bytearray(resp), dtype="uint8")
### PAINTING IN RGB OR BGR ?
    try:
        # reshape the image data as color pixels
        painting = cv2.imdecode(img, -1).reshape((-1, 3))
    except:
        print("ERROR IMAGE with", item["url"])
        print(resp)
        return({}, item["style"])
    # compute the histogram
    full_histogram = make_histogram(painting.tolist())
    # get the maximum pixel count
    counts = max(full_histogram.values())
    # filter out colors with only 1 pixel (usually around 50%) and normalize
    # and round the counts to save space in the file
    histogram = {k:round(v/counts, 2) for k, v in full_histogram.items() if v>1}
    return (histogram, item["style"])

def mp_handler(data, test=False):
    cpus = multiprocessing.cpu_count()
    p = multiprocessing.Pool(cpus)

    histogram = {}

    # for genre in GENRES:
    #     genre = genre.replace("-", "_")
    #     globals()[genre+"_file"] = eval("open('histograms/genre_"+genre+".txt', 'w')")

    for idx, result in enumerate(p.imap(mp_worker, data)):
        if not test:
            # with open("../data/histograms.json", "r") as json_file:
            #     histogram = json.load(json_file)
            for key, value in result[0].items():
                if not key in histogram:
                    histogram[key] = value
                else:
                    histogram[key] = round(0.5*(histogram[key]+value), 2)
            if idx+1 in range(0, 400+100, 100):
                print("processed", idx+1, "paintings")

    # remove 0.0 counts
    histogram = {k:v for k, v in histogram.items() if v>0.0}

    if not test:   
        with open("../data/histograms.json", "w") as json_file:
            json.dump(histogram, json_file)

        #     mean_histogram = result[0]
        # eval(result[1].replace("-", "_")+"_file.write(',_'+result[0])")

    # read file extract previous histogram
        # for all_paintings file
        # for this item genre
    # compute mean with previous histograms


if __name__ == '__main__':
    import cProfile, pstats
    
    # select the 35 first paintings of the dataset
    with open("../data/paintings.json", "r") as json_file:
        data = json.loads(json_file.read())

    mp_handler(data[:400])

    with open("../data/histograms.json", "r") as json_file:
        histogram = json.load(json_file)

    print(len(histogram.keys()), min(histogram.values()), max(histogram.values()))

    # data1 = {'artist': 'Giuseppe Arcimboldo', 'genre': 'allegorical-painting', 'url': 'http://uploads0.wikiart.org/autumn-1573(1).jpg', 'DB': 'wikiart', 'title': 'Autumn', 'style': 'mannerism-late-renaissance', 'year': '1573'}       

    # cProfile.run("mp_worker(data1)", "{}.profile".format(__file__))
    # s = pstats.Stats("{}.profile".format(__file__))
    # s.strip_dirs()
    # s.sort_stats("time").print_stats(10)

    # def test_single_threaded():
    #     for item in data[:35]:
    #         mp_worker(item)

    # cProfile.run("test_single_threaded()", "{}.profile".format(__file__))
    # s = pstats.Stats("{}.profile".format(__file__))
    # s.strip_dirs()
    # s.sort_stats("time").print_stats(10)

    # cProfile.run("mp_handler(data[:35], test=True)", "{}.profile".format(__file__))
    # s = pstats.Stats("{}.profile".format(__file__))
    # s.strip_dirs()
    # s.sort_stats("time").print_stats(10)


    # # load the image from item url
    # painting = cv2.imread("../local/meadows.jpg")
    # # convert the colors to the proper color spaces
    # image_rgb = cv2.cvtColor(painting, cv2.COLOR_BGR2RGB)
    # # reshape the color data
    # rgb_data = image_rgb.reshape(image_rgb.shape[0]*image_rgb.shape[1], 3)
    # # compute the histogram
    # full_histogram = make_histogram(rgb_data.tolist())

    # # for testing, only use 32 bins so that matplotlib can scatter it
    # bins = 32
    # # make 3D histogram of colors in painting
    # hist_RGB = cv2.calcHist([image_rgb], [0, 1, 2], None, [bins, bins, bins],
    #                         [0, 255, 0, 255, 0, 255])
    # # normalize it
    # cv2.normalize(hist_RGB, hist_RGB)
    
    # positions = [[i, j, k] for i in range(bins) for j in range(bins)
    #              for k in range(bins)]
    # positions = np.array(positions)

    # # filter out colors with only 1 pixel (usually around 50%) to save space
    # histogram = {k:v for k, v in full_histogram.items() if v>1}
    # # save the histogram
    # with open("../data/histogram_meadows.json", "w") as json_file:
    #     json.dump(histogram, json_file)

    # import matplotlib.pyplot as plt
    # from mpl_toolkits.mplot3d import Axes3D

    # fig = plt.figure(figsize=(12, 6), tight_layout=True)
    # fig.add_subplot(121)
    # plt.imshow(image_rgb)
    # plt.xticks([])
    # plt.yticks([])
    # ax = fig.add_subplot(122, projection='3d', elev=30, azim=20)

    # ax.scatter(positions[:, 0], positions[:, 1], positions[:, 2],
    #            facecolors=positions/bins, s=10*hist_RGB*bins**2)

    # plt.show()    
