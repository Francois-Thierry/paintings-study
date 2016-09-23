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

# I discarded "design" (2983 images), "sculpture" (2712 images),
# "installation" (1673 images), "photo" (1092 images), "poster" (623 images),
# "caricature" (435), "calligraphy" (234 images), "graffity" (194 images), and
# "advertisement" (122 images). I also didn't took genres with less than 100
# images.
# 2016.08.29

GENRES = ['portrait', 'landscape', 'genre-painting', 'abstract',
          'religious-painting', 'cityscape', 'sketch-and-study', 'illustration',
          'figurative', 'still-life', 'symbolic-painting', 'nude-painting-nu',
          'mythological-painting', 'marina', 'animal-painting',
          'flower-painting', 'self-portrait', 'allegorical-painting',
          'history-painting', 'interior', 'literary-painting',
          'battle-painting', 'wildlife-painting', 'capriccio', 'cloudscape',
          'veduta', 'miniature', 'tessellation', 'pastorale',
          'bird-and-flower-painting']

def mp_worker(item):
    # open painting from item url
    # compute histogram
    # read file extract previous histogram
        # for all_paintings file
        # for this item genre
    # compute mean with previous histograms
    # return (histogram_mean_all, histogram_mean_genre, item["genre"])
    return (item["title"], item["genre"])

def mp_handler(data):
    cpus = multiprocessing.cpu_count()
    p = multiprocessing.Pool(cpus)

    for genre in GENRES:
        genre = genre.replace("-", "_")
        globals()[genre+"_file"] = eval("open('histograms/genre_"+genre+".txt', 'w')")

    for result in p.imap(mp_worker, data):
        eval(result[1].replace("-", "_")+"_file.write(',_'+result[0])")


if __name__ == '__main__':
    
    # with open("../paintings.json", "r") as json_file:
    #     data = json.loads(json_file.read())
    # mp_handler(data)

    # for testing, only use 32 bins so that matplotlib can scatter it
    # bins = 512
    
    # overcome the cors limitation
    # load the image from item url
    painting = cv2.imread("../local/flow.jpg")
    # convert the colors to the proper color spaces
    image_rgb = cv2.cvtColor(painting, cv2.COLOR_BGR2RGB)
    image_rgb = image_rgb.reshape(image_rgb.shape[0]*image_rgb.shape[1], 3)
    # image_rgb = image_rgb.flatten()

    def count(colors):
        results = {}
        for color in colors:
            color_key = ",".join([str(i) for i in color])
            if color_key not in results:
                results[color_key] = 1
            else:
                results[color_key] += 1
        return results

    counts_dict = count(image_rgb.tolist())
    print(len(image_rgb), len(counts_dict))

    # remove unique pixels
    # image_rgb = image_rgb[counts!=1]

    # print(max(counts))
    
    # particles = int(len(image_rgb)/3)
    # positions = np.zeros(len(image_rgb))
    # print(len(positions))

    # for i in range(len(positions)):
    #     positions[3*i+0] = image_rgb[3*i+0]/255
    #     positions[3*i+1] = image_rgb[3*i+1]/255
    #     positions[3*i+2] = image_rgb[3*i+2]/255

    # # make 3D histogram of colors in painting
    # hist_RGB = cv2.calcHist([image_rgb], [0, 1, 2], None, [bins, bins, bins],
    #                         [0, 255, 0, 255, 0, 255])
    # # normalize it
    # cv2.normalize(hist_RGB, hist_RGB)

    # # positions are colors too
    # positions = [[i, j, k] for i in range(bins) for j in range(bins)
    #              for k in range(bins)]
    # # positions = [[i/bins, j/bins, k/bins, hist_RGB[i, j, k]]
    # #              for i in range(bins) for j in range(bins) for k in range(bins)]
    # positions = np.array(positions)

    # hist_RGB = hist_RGB.flatten()
    # # # hist_RGB /= hist_RGB.max()

    # positions = positions[hist_RGB != 0.0, :]/255

    # print(len(positions.flatten()))



     # ==> 13 sec for 256 bins

    # import matplotlib.pyplot as plt
    # from mpl_toolkits.mplot3d import Axes3D

    # fig = plt.figure(figsize=(12, 6), tight_layout=True)
    # fig.add_subplot(121)
    # plt.imshow(image_rgb)
    # plt.xticks([])
    # plt.yticks([])
    # ax = fig.add_subplot(122, projection='3d', elev=30, azim=20)

    # ax.scatter(image_rgb[:, 0], image_rgb[:, 1], image_rgb[:, 2],
    #            facecolors=image_rgb/255)

    # # # ==> 3.7 sec !!!

    # ax.scatter(positions[:, 0], positions[:, 1], positions[:, 2],
    #        facecolors=positions/bins)
    # # ax.scatter(positions[:, 0], positions[:, 1], positions[:, 2],
    # #            facecolors=positions/bins, s=hist_RGB*bins**2)

    # # # ==> really long !!!!!!!!!!

    # plt.show()
    
    pass