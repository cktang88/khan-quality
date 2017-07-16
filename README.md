# Khan-Quality

An app to find videos that need attention in Khan Academy.

## Motivation

When using Khan Academy one day, I found several videos had low resolution, suboptimal sound quality, or many similar critical comments in "Tips & Thanks" that were unanswered. This correlated with videos that needed updating. I decided to make this to hopefully find all such videos automatically and highlight them.

Note: I highly admire Khan Academy, and this app is made to be helpful, not critical.

## Challenges

1. Contructing a list of videos from Khan Academy. 
    * Problems: Full topic tree is 74MB JSON file, and is in recursive nested tree format.
    * Goal: crawl it myself efficiently, with the goal of having a flat, non-nested array of videos.
    * Solution: Recursively crawl with promises, flatten on each recursive tail call.
2. Mongo DB incorrect count of videos compared to topic list
    * Solution: originally had not closed db correctly. Fixed, but problem persists. Realized some identical videos are listed under multiple topics.

## Misc.

- MapDB to analyze data? or hadoop/mapreduce/spark


## Dev
Code linting with [AirBnB's style guide](https://github.com/airbnb/javascript):
```
$ npm run lint
```

## License

This work is licensed under the [The MIT License](http://opensource.org/licenses/MIT)
