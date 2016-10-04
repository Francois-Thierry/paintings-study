# A Study of paintings

[This webpage](https://francois-thierry.github.io/) regroups the results of my experimentations using computer-vision and machine-learning methods to describe and classify paintings. I will ultimately publish a paper on arxiv on this matter. Below you will find some notes and inspirations sources regarding the code developed for this study.

### Javascript Code

I used [d3.js](https://d3js.org/) for 2D plots and [three.js](http://threejs.org/) for 3D plots.

For the first figure I used for the HL heatmap and the code provided alongside the paper from XXX for the 3D code.

I implemented the bibliography management using [bibtexParse.js](https://github.com/ORCID/bibtexParseJs). It should be noted that the entries "bookTitle" of "inproceedings" bibentries have been changed to "journal" for convenience (later on I will switch between "journal", "bookTitle", etc.).

### Python Code

Features extraction and machine-learning codes are implemented for python 3 and use numpy, scipy, pyopencv and scikit-learn.

**Install opencv 3.1 with python 3.4+ on linux (2016/04/20)**

I encountered some trouble to install the last version of opencv for python 3. I finally got it using the method from [pyimagesearch.org](http://www.pyimagesearch.com/2015/07/20/install-opencv-3-0-and-python-3-4-on-ubuntu/)

	sudo apt-get update
	sudo apt-get upgrade
	sudo apt-get install build-essential cmake git pkg-config
	sudo apt-get install libjpeg8-dev libtiff5-dev libjasper-dev libpng12-dev
	sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev
	sudo apt-get install libgtk2.0-dev
	sudo apt-get install libatlas-base-dev gfortran

	cd ~
	git clone https://github.com/itseez/opencv.git
	cd opencv
	git checkout 3.1.0

	cd ~
	git clone https://github.com/itseez/opencv_contrib.git
	cd opencv_contrib
	git checkout 3.1.0

	cd ~/opencv
	mkdir build
	cd build
	cmake -D CMAKE_BUILD_TYPE=RELEASE \
		-D CMAKE_INSTALL_PREFIX=/usr/local \
		-D INSTALL_C_EXAMPLES=OFF \
		-D INSTALL_PYTHON_EXAMPLES=ON \
		-D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib/modules \
		-D BUILD_EXAMPLES=ON ..
	make -j8 # 8 is the number of cores in my laptop
	sudo make install
	sudo ldconfig

For the Flann KNN matcher to work, I had to comment out line 163 of cv2.cpp
in ..\opencv\modules\python\src2 and recompile ([source](http://answers.opencv.org/question/76952/regarding-the-error-message-the-data-should-normally-be-null/)).
