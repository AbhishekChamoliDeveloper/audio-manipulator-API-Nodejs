const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const util = require("util");
const ffmpeg = require("fluent-ffmpeg");

const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);

async function reverbAudio(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  const reverbOptions = req.body.reverbOptions || {
    aecho: {
      in_gain: 0.5,
      out_gain: 0.5,
      delay: 500,
      decay: 0.8,
    },
  };

  try {
    const inputBuffer = req.file.buffer;
    const inputFilename = uuidv4() + ".wav";
    const outputFilename = uuidv4() + ".wav";

    await writeFileAsync(inputFilename, inputBuffer);

    const audioFilter = Object.entries(reverbOptions)
      .map(([filter, options]) => {
        return `${filter}=${Object.values(options).join(":")}`;
      })
      .join("|");

    ffmpeg()
      .input(inputFilename)
      .audioFilters(audioFilter)
      .toFormat("wav")
      .on("end", async () => {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${outputFilename}`
        );

        const fileStream = fs.createReadStream(outputFilename);
        fileStream.pipe(res);

        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
      })
      .on("error", async (error) => {
        console.error("Error applying reverb:", error);
        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
        res.status(500).json({ message: "Error applying reverb" });
      })
      .save(outputFilename);
  } catch (err) {
    console.error("Error processing audio:", err);
    res.status(500).json({ message: "Error processing audio" });
  }
}

async function echoAudio(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  const echoPercentage = req.body.echoPercentage || 50;
  const echoIntensity = (echoPercentage / 100).toFixed(2);

  const echoOptions = {
    filter: "aecho",
    options: `${echoIntensity}:${echoIntensity}:1000|1800:${echoIntensity}|${echoIntensity}`,
  };

  try {
    const inputBuffer = req.file.buffer;
    const inputFilename = uuidv4() + ".wav";
    const outputFilename = uuidv4() + ".wav";

    await writeFileAsync(inputFilename, inputBuffer);

    ffmpeg()
      .input(inputFilename)
      .audioFilters(echoOptions.filter + "=" + echoOptions.options)
      .toFormat("wav")
      .on("end", async () => {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${outputFilename}`
        );

        const fileStream = fs.createReadStream(outputFilename);
        fileStream.pipe(res);

        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
      })
      .on("error", (error) => {
        console.error("Error applying echo:", error);
        res.status(500).json({ message: "Error applying echo" });
      })
      .save(outputFilename);
  } catch (err) {
    console.error("Error processing audio:", err);
    res.status(500).json({ message: "Error processing audio" });
  }
}

async function changeSpeedAndPitch(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  const speedFactor = req.body.speedFactor || 1.5;

  try {
    const inputBuffer = req.file.buffer;
    const inputFilename = uuidv4() + ".wav";
    const outputFilename = uuidv4() + ".wav";

    await writeFileAsync(inputFilename, inputBuffer);

    ffmpeg()
      .input(inputFilename)
      .audioFilters(`asetrate=44100*${speedFactor},aresample=44100`)
      .toFormat("wav")
      .on("end", async () => {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${outputFilename}`
        );

        const fileStream = fs.createReadStream(outputFilename);
        fileStream.pipe(res);

        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
      })
      .on("error", async (error) => {
        console.error("Error changing speed and pitch:", error);
        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
        res.status(500).json({ message: "Error changing speed and pitch" });
      })
      .save(outputFilename);
  } catch (err) {
    console.error("Error processing audio:", err);
    res.status(500).json({ message: "Error processing audio" });
  }
}

async function normalizeAudio(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  try {
    const inputBuffer = req.file.buffer;
    const inputFilename = uuidv4() + ".wav";
    const outputFilename = uuidv4() + ".wav";

    await writeFileAsync(inputFilename, inputBuffer);

    ffmpeg()
      .input(inputFilename)
      .audioFilters("loudnorm=I=-16:LRA=11:TP=-1.5")
      .toFormat("wav")
      .on("end", async () => {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${outputFilename}`
        );

        const fileStream = fs.createReadStream(outputFilename);
        fileStream.pipe(res);

        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
      })
      .on("error", async (error) => {
        console.error("Error normalizing audio:", error);
        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
        res.status(500).json({ message: "Error normalizing audio" });
      })
      .save(outputFilename);
  } catch (err) {
    console.error("Error processing audio:", err);
    res.status(500).json({ message: "Error processing audio" });
  }
}

async function mergeAudioFiles(req, res) {
  if (!req.files || req.files.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two audio files required for merging" });
  }

  try {
    const mergedAudio = new ffmpeg();

    req.files.forEach((audioFile) => {
      const inputBuffer = audioFile.buffer;
      const inputFilename = uuidv4() + ".wav";

      mergedAudio.input(inputFilename);

      writeFileAsync(inputFilename, inputBuffer)
        .then(() => {
          unlinkAsync(inputFilename);
        })
        .catch((error) => {
          console.error("Error processing audio:", error);
          res.status(500).json({ message: "Error processing audio" });
        });
    });

    const outputFilename = uuidv4() + ".wav";

    mergedAudio
      .mergeToFile(outputFilename)
      .on("end", async () => {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${outputFilename}`
        );

        const fileStream = fs.createReadStream(outputFilename);
        fileStream.pipe(res);

        await unlinkAsync(outputFilename);
      })
      .on("error", async (error) => {
        console.error("Error merging audio:", error);
        await unlinkAsync(outputFilename);
        res.status(500).json({ message: "Error merging audio" });
      });
  } catch (err) {
    console.error("Error processing audio:", err);
    res.status(500).json({ message: "Error processing audio" });
  }
}

async function trimAudio(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file provided" });
  }

  const startTime = req.body.startTime || 0;
  const endTime = req.body.endTime || 10;

  try {
    const inputBuffer = req.file.buffer;
    const inputFilename = uuidv4() + ".wav";
    const outputFilename = uuidv4() + ".wav";

    await writeFileAsync(inputFilename, inputBuffer);

    ffmpeg()
      .input(inputFilename)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .toFormat("wav")
      .on("end", async () => {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${outputFilename}`
        );

        const fileStream = fs.createReadStream(outputFilename);
        fileStream.pipe(res);

        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
      })
      .on("error", async (error) => {
        console.error("Error trimming audio:", error);
        await unlinkAsync(inputFilename);
        await unlinkAsync(outputFilename);
        res.status(500).json({ message: "Error trimming audio" });
      })
      .save(outputFilename);
  } catch (err) {
    console.error("Error processing audio:", err);
    res.status(500).json({ message: "Error processing audio" });
  }
}

module.exports = {
  reverbAudio,
  echoAudio,
  changeSpeedAndPitch,
  normalizeAudio,
  trimAudio,
  mergeAudioFiles,
};
