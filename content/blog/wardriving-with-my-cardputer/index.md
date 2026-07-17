+++
title = "Wardriving with my Cardputer"
date = 2026-07-16

[taxonomies]
tags = ["cardputer", "hacking"]

[extra]
emoticon = ">:}"
+++

My girlfriend gifted me a [Cardputer Adv](https://shop.m5stack.com/products/m5stack-cardputer-adv-version-esp32-s3) for my birthday, and I've had a lot of fun tinkering with it. I wanted a compact device to learn some white hat hacking. This made me want the [Flipper Zero](https://flipper.net/), until I saw that the base unit was $200! O_O. So I asked for a $30 Cardputer instead, and it's been great.

I've added many expansion modules so far: An [IR emitter/receiver](https://shop.m5stack.com/products/ir-unit?variant=16804756979802), an [RFID module](https://shop.m5stack.com/products/rfid-unit-2-ws1850s?variant=40753463885996), a [CC1101 + nRF24L01 cap](https://www.pingequa.com/products/cardputer-adv-hydra-rf-424), and a [GPS module](https://shop.m5stack.com/products/gps-bds-unit-v1-1-at6668?variant=45727253692673). For the firmware, I use [Launcher](https://bmorcelli.github.io/Launcher/) and primarily [Bruce](https://bruce.computer/), although there are a few bugs depending on the version.

{{ row2(src1="cardputer_front.jpg", alt1="Front view for my cardputer.", src2="cardputer_back.jpg", alt2="Back view of my cardputer.") }}

My favorite activity is to do some [wardriving](https://en.wikipedia.org/wiki/Wardriving) with the GPS module. For the unaware: wardriving is the practice of using a wireless device while moving to search for Wi-Fi networks and Bluetooth devices. A typical piece of Wardriving software will search for a network and then log the GPS location, which can be used to make a map of different networks. 

Why? Ethical wardrivers might be doing anything from OSINT investigations to security audits, while malicious wardrivers could be searching for vulnerable networks, for example.

For me, it's just interesting and fun to map out all of the networks in my area. I do live in the dense city of Chicago, but I still find it crazy just how many networks are around me, ~18k so far! And I've only been doing this for about a month. Here is my latest map as of making this post:

{{ image(src="wardriving_map.png", alt="My wardriving map.", style="border-radius: 8px;") }}

You can probably guess roughly where I live. I also enjoy finding funny SSIDs. Here are my top 3:
- `Fist my Bump`
- `WhoWhatWhereWhenWhyFi`
- `unoriginal network name`

Can't wait to see what other shenanigans I get up to with my cardputer.