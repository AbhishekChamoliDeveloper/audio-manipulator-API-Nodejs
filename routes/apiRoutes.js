const express = require("express");
const router = express.Router();

const audioUploader = require("../utils/audioUploader");
const apiControllers = require("../controllers/apiControllers");

router.post(
  "/reverb",
  audioUploader.single("audioFile"),
  apiControllers.reverbAudio
);

router.post(
  "/echo",
  audioUploader.single("audioFile"),
  apiControllers.echoAudio
);

router.post(
  "/change-speed-and-pitch",
  audioUploader.single("audioFile"),
  apiControllers.changeSpeedAndPitch
);

router.post(
  "/normalize-audio",
  audioUploader.single("audioFile"),
  apiControllers.normalizeAudio
);

router.post(
  "/trim-audio",
  audioUploader.single("audioFile"),
  apiControllers.trimAudio
);

router.post(
  "/merge-audio-files",
  audioUploader.array("audioFile"),
  apiControllers.mergeAudioFiles
);

module.exports = router;
