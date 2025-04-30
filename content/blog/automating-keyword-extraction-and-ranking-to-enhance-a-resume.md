+++
title = "Automating keyword extraction and ranking to enhance a resume"
date = 2025-04-29

[taxonomies]
tags = ["python", "LLM"]

[extra]
emoticon = "^_^"
+++

- TL;DR I extracted keywords from job descriptions with [Gemini](https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/) and created a Python script to rank them to enhance my friend's resume.

I spent some time this past week helping a friend update their resume.
For tech roles, it isn't easy to pass the resume screen stage (as of 04/25).
Due to the large volume of applicants, resumes are filtered out by automated parsers which check for desirable keywords.
Since these resume parsers are closed source and every company operates differently, finding the right keywords is a very inexact science, but that never stopped me from trying :).

A solid strategy is to pull keywords from the job descriptions you are applying to, but this is time-consuming especially if you need to apply to 100+ roles.
I decided to automate this somewhat and I outlined these steps:
1. Extract keywords from job postings.
2. Rank the keywords based on how frequently they appear.
3. Take the top X keywords and include them in the resume.

I brainstormed possible programs for keyword extraction, but after doing some testing, it seems like modern LLMs are reasonably good at it. So I created this prompt:

```md
From the supplied job description, take all of the relevant keywords that an average ATS system will look for in resumes when choosing to move a candidate forward to the next round and put them in order from most to least impactful in this decision. Have your output be a numbered list with just the keywords and no paragraph at the top. Example:
  1. keyword_1
  2. keyword_2
  3. keyword_3
  Make sure to get ALL of the keywords. Here is the job description: 

  <job description>
```

I manually fed the prompt to [Gemini 2.5](https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/), copied the output to a file, added a line with the company name, and repeated for 10 job descriptions. 
I could have automated this by creating a web scraper that calls the Gemini API, but 10 was enough and I was lazy :P. Maybe I'll come back and code it on a rainy day.

The resulting file looked something like this:

```md
---
google
1. Software Engineer / Platform Engineer
2. Rust
3. Go
4. C++
5. Java

...
```

I then wrote a Python script to parse and rank the keywords. 
Note that at the start, I added this regex `re.sub(r"\(.*?\)", "", line)` since Gemini liked to add unecessary abreviations wrapped in parentheses. Ex: `Service Oriented Architecture (SOA)`.

The script then creates dictionaries for each company ranking (remember there is a list of keywords for each company/job posting). It assigns each keyword a score and takes the largest one if there are duplicates.
Finally, it combines the dictionaries by adding together the scores of duplicate keywords across company dicts and creates a file with the final ranking of each keyword.

```Python
    file_lines = open("Keywords.md", "r").readlines()
    file_lines = [re.sub(r"\(.*?\)", "", line) for line in file_lines]
    file_lines = [line.strip() for line in file_lines]
    file_lines = [line for line in file_lines if line]

    company_keywords = {}
    curr_company = None

    # get keywords by company
    for i in range(1, len(file_lines)):
        prev, curr = file_lines[i-1], file_lines[i]
        if prev == "---":
            curr_company = curr
            if curr_company not in company_keywords:
                company_keywords[curr] = {}
            continue
        elif curr != "---" and curr_company:
            num, string = curr.split(". ", 1)
            score = 100 - int(num)

            if string not in company_keywords[curr_company]:
                company_keywords[curr_company][string] = score
            elif score > company_keywords[curr_company][string]:
                company_keywords[curr_company][string] = score

    # combine dicts
    res = Counter({})
    for k, d in company_keywords.items():
        res += Counter(d)

    with open("results.txt", "w") as f:
        for k, d in sorted(res.items(), key=lambda x: x[1], reverse=True):
            f.write(f"{k} : {d}\n")
```

Here's the top 10 keywords and their scores:

```
Python : 1145
Software Engineer : 1072
Java : 1054
Collaboration : 840
Computer Science : 712
Design : 699
Problem Solving : 607
C++ : 567
Reliability : 547
Automation : 544
```

It would be hard to meaningfully test the effectiveness of these keywords, but based on my experience and the job descriptions I pulled from, they seem pretty good.
Some good enhancements for the future would be the aforementioned web scraper and a more robust scoring system. Overall though, I'm glad I was able to help my friend and that whenever I need to update my resume, I can use this program.
