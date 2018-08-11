# Khan-Quality

[![Greenkeeper badge](https://badges.greenkeeper.io/cktang88/khan-quality.svg)](https://greenkeeper.io/)

An app to find videos that need attention in Khan Academy.

## Motivation

When using Khan Academy one day, I found several videos had low resolution, suboptimal sound quality, or several similar critical comments in "Tips & Thanks" that were unanswered. This often correlated with videos that needed updating. I created this project to hopefully find all such videos automatically and highlight them for further attention.

Note: I'm a huge fan of Khan Academy, and this app is made to be helpful, not critical.

## Challenges

1. Contructing a list of videos from Khan Academy. 
    * Problems: Full topic tree is 74MB JSON file, and is in recursive nested tree format.
    * Goal: crawl it myself efficiently, with the goal of having a flat, non-nested array of videos.
    * Solution: Recursively crawl with promises, flatten on each recursive tail call.
2. Mongo DB incorrect count of videos compared to topic list
    * Solution: originally had not closed db correctly. Fixed, but problem persists. Realized some identical videos are listed under multiple topics.

## What I've learned
Khan Academy grows at a staggering pace. When I originally retrieved the topic tree in July 15th, 2017, there were three or four videos with broken links, and had 17997 videos, 9563 of which were unique. As of August 4, 2017, there are 18374 videos, 9599 of which are unique. In addition, only one of video was found to have a broken link, a significant improvement.

## Misc.

- MapDB to analyze data? or hadoop/mapreduce/spark


## Dev
```
$ git clone https://github.com/cktang88/khan-quality
$ cd khan-quality
$ npm i --dev

# create a config.env(containing db vars) and Procfile for running on Heroku locally

# 1. collecting data: 
# put 'worker: npm run collectData' in Procfile
$ heroku local -e config.env

# 2. analyzing data:
# put 'worker: npm run analyze' in Procfile
$ heroku local -e config.env
```
Code linting with [AirBnB's style guide](https://github.com/airbnb/javascript):
```
$ npm run lint
```

## License

This work is licensed under the [The MIT License](http://opensource.org/licenses/MIT)
