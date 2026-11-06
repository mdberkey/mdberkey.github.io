+++
title = "Powering off TVs with my Cardputer"
date = 2026-07-30

[taxonomies]
tags = ["cardputer", "ethical-hacking"]

[extra]
emoticon = "[X_X]"
+++

I've been having fun exploring the [infrared features](https://wiki.bruce.computer/features/ir/) of [Bruce firmware](https://bruce.computer/) on my [cardputer](https://shop.m5stack.com/products/m5stack-cardputer-adv-version-esp32-s3). My favorite is the TV-B-Gone function, which spams 100+ `power off` signals used by common TVs and displays.

{{ video(src="tvbgone.mp4", desc="Turning off 3 TVs with my cardputer.") }}

A standalone cardputer has a built-in IR blaster, but it's incredibly weak. I have to point it directly at my TV's receiver from ~2 ft away for it to work. I bought this [IR emitter & receiver module](https://shop.m5stack.com/products/ir-unit), but the emitter only has ~3 ft of range.

I wanted to use my cardputer like a typical TV remote, so I bought this [3W IR transmitter](https://www.aliexpress.us/item/3256807806520912.html?gatewayAdapt=glo2usa4itemAdapt). After some testing, it has a much better range of ~30 ft. I did have to use some duct tape to attach it to my cardputer and keep the wires compact.

{{ image(src="IR_emitter.png", alt="My 5V IR emitter attached to my cardputer.", style="border-radius: 8px;") }}

Bruce also has this cool jamming feature which can essentially "blind" an IR receiver, causing it not to register signals from other devices. I've also used the IR receiver on my expansion module to read and save incoming signals, allowing me to clone TV remotes.

Looking forward to testing this on other devices with IR receivers such as LED strips, AC units, etc. Also, fun fact: most cameras can "see" IR light, and my phone's camera has been very useful for debugging.

{{ image(src="IR_blasting.gif", alt="My IR emitter visibly emitting.", style="border-radius: 8px;") }}
