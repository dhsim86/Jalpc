---
layout: post
title:  "F2FS: A New File System for Flash Storage - Usenix"
date:   2017-04-01
desc: "F2FS: A New File System for Flash Storage - Usenix"
keywords: "Linux, File System, Linux Kernel, F2FS"
categories: [Linux]
tags: [file system, kernel, linux]
icon: icon-html
---

# **F2FS: A New File System for Flash Storage**

[https://www.usenix.org/conference/fast15/technical-sessions/presentation/lee][url]

<br>
## **Authors:**

**Changman Lee, Dongho Sim, Joo-Young Hwang, and Sangyeun Cho, Samsung Electronics Co., Ltd.**

<br>
## **Open Access Content**

USENIX is committed to Open Access to the research presented at our events. Papers and proceedings are freely available to everyone once the event begins. Any video, audio, and/or slides that are posted after the event are also free and open to everyone. Support USENIX and our commitment to Open Access.

[Lee PDF Download][pdf_download]
<br>
[View the slides][slide_download]
<br>
[BibTeX Download][bibtext_download]

[url]: https://www.usenix.org/conference/fast15/technical-sessions/presentation/lee
[pdf_download]: https://www.usenix.org/system/files/conference/fast15/fast15-paper-lee.pdf
[slide_download]: https://www.usenix.org/sites/default/files/conference/protected-files/fast15_slides_lee.pdf
[bibtext_download]: https://www.usenix.org/biblio/export/bibtex/188454

<br>
## **Abstract**

F2FS is a Linux file system designed to perform well on modern flash storage devices. The file system builds on append-only logging and its key design decisions were made with the characteristics of flash storage in mind. This paper describes the main design ideas, data structures, algorithms and the resulting performance of F2FS.

Experimental results highlight the desirable performance of F2FS; on a state-of-the-art mobile system, it outperforms EXT4 under synthetic workloads by up to 3.1 (iozone) and 2 (SQLite). It reduces elapsed time of several realistic workloads by up to 40%. On a server system, F2FS is shown to perform better than EXT4 by up to 2.5 (SATA SSD) and 1.8 (PCIe SSD).

---

<script type="text/javascript">
   function videoPlay() {
     var video_title = "F2FS: A New File System for Flash Storage";
     if (typeof _gaq !== "undefined") {
       _gaq.push(['_trackEvent', 'Video', 'Play', video_title]);
     }
   }
   jQuery(document).ready(
                          function() {
                            var video_id = "usenix-media-video-1";
                            var video = document.getElementById(video_id);
                            video.addEventListener("play", videoPlay, false);
                          });
</script>

<div class="usenix-video-field">
  <h4>Presentation Video</h4>
    <video width="640" height="480"  id="usenix-media-video-1" data-setup="{}" height="419" width="744" poster="https://www.usenix.org/sites/default/files/styles/video-thumbnail/public/conference/video/lee_4.jpeg?itok=MJN-5nxY" class="video-js vjs-default-skin vjs-big-play-centered" preload="auto" controls>
    <source src='https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.mp4' type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
               <source src='https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.webm' type='video/webm; codecs="vp8.0, vorbis"'>
        <object type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.1.swf" width="640" height="480">
       <param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.1.swf">
       <param name="allowFullScreen" value="true">
       <param name="wmode" value="transparent">
       <param name="flashVars" value="config={'playlist':['https%3A%2F%2Fwww.usenix.org%2Fsites%2Fdefault%2Ffiles%2Fstyles%2Fvideo-thumbnail%2Fpublic%2Fconference%2Fvideo%2Flee_4.jpeg%3Fitok%3DMJN-5nxY',{'url':'https%3A%2F%2F2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com%2Ffast15%2Flee.mp4','autoPlay':false}]}">
       <img src="https://www.usenix.org/sites/default/files/styles/video-thumbnail/public/conference/video/lee_4.jpeg?itok=MJN-5nxY" width="640" height="480" title="No video playback capabilities. Please install Adobe Flash Player or download the video below">
    </object>
  </video>

  <p><a href="https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.mp4">Download Video</a></p>
</div>
<h4>Presentation Audio</h4>
<div id="usenix-media-audio-1">
  <audio controls>
          <source src='https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.mp3'>
              <source src='https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.ogg'>
              <a href="https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.mp3">MP3 Download</a>
              <a href="https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.ogg">OGG Download</a>
      </audio>
  <p><a href="https://2459d6dc103cb5933875-c0245c5c937c5dedcca3f1764ecc9b2f.ssl.cf2.rackcdn.com/fast15/lee.mp3">Download Audio</a></p>
</div>
