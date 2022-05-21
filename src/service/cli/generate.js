"use strict";

const moment = require(`moment`);
const fs = require(`fs`).promises;
const {nanoid} = require(`nanoid`);

const {ExitCode, MAX_ID_LENGTH} = require(`../../constants`);
const {getRandomInt, shuffle, customConsole} = require(`../../utils`);

const FILE_NAME = `mocks.json`;
const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;
const MAX_COMMENTS = 4;

const FILE_SENTENCES_PATH = `./src/data/sentences.txt`;
const FILE_TITLES_PATH = `./src/data/titles.txt`;
const FINE_CATEGORIES_PATH = `./src/data/categories.txt`;
const FILE_COMMENTS_PAHT = `./src/data/comments.txt`;

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf-8`);
    return content.trim().split(`\n`);
  } catch (err) {
    customConsole.error(err);
    return [];
  }
};

const generateComments = (count, comments) => (Array(count).fill({}).map(() => ({
  id: nanoid(MAX_ID_LENGTH),
  text: shuffle(comments)
    .slice(0, getRandomInt(1, 3))
    .join(` `)
})));

const generateArticle = (data) => {
  const {count, sentencesData, titlesData, categoriesData, commentsData} = data;
  return Array(count)
    .fill({})
    .map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      title: titlesData[getRandomInt(0, titlesData.length - 1)],
      createdDate: moment()
        .add(-getRandomInt(1, 90), `day`)
        .format(`DD-MM-YYYY hh:mm:ss`),
      announce: shuffle(sentencesData).slice(0, getRandomInt(0, 4)),
      сategory: shuffle(categoriesData).slice(0, categoriesData.length - 1),
      comments: generateComments(getRandomInt(1, MAX_COMMENTS), commentsData),
    }));
};

const checkCountArticle = (count) => {
  if (count > MAX_COUNT) {
    customConsole(`Не больше 1000 публикаций`);
    process.exit(ExitCode.error);
  }
};

module.exports = {
  name: `--generate`,
  async run(args) {
    const sentencesData = await readContent(FILE_SENTENCES_PATH);
    const titlesData = await readContent(FILE_TITLES_PATH);
    const categoriesData = await readContent(FINE_CATEGORIES_PATH);
    const commentsData = await readContent(FILE_COMMENTS_PAHT);

    const [count] = args;
    checkCountArticle(count);
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const content = JSON.stringify(generateArticle({
      count: countOffer,
      sentencesData,
      titlesData,
      categoriesData,
      commentsData,
    }));
    try {
      await fs.writeFile(FILE_NAME, content);
      customConsole.info(`Operation success. File created.`);
    } catch (err) {
      customConsole.error(`Can't write data to file...`);
    }
  },
};
