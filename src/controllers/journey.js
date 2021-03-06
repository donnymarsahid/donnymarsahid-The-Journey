const { journey, user, bookmark } = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Get all data journey
exports.getJourneys = async (req, res) => {
  try {
    const journeys = await journey.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: user,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: bookmark,
          as: "bookmarks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["updatedAt", "idUser"],
      },
    });

    res.status(200).send({
      status: "success",
      data: journeys,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "server error",
    });
  }
};

// Add data journey
exports.addJourney = async (req, res) => {
  try {
    const journeyExists = await journey.findOne({
      where: {
        title: req.body.title,
      },
    });
    if (journeyExists) {
      res.status(500).send({
        status: "failed",
        message: "journey already exists",
      });
      return false;
    }

    const idUser = req.user.id;
    const path = process.env.IMG_URL;
    const upload = req.file.filename;
    const imageUpload = path + upload;
    const newJourney = await journey.create({
      ...req.body,
      image: imageUpload,
      idUser,
    });
    const { title, description } = newJourney;

    res.status(200).send({
      status: "success",
      title,
      description,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "server error",
    });
  }
};

// Get detail journey with id params
exports.getDetailJourney = async (req, res) => {
  try {
    const idJourney = req.params.id;
    const findJourney = await journey.findOne({
      where: {
        id: idJourney,
      },
      include: [
        {
          model: bookmark,
          as: "bookmarks",
          exclude: ["createdAt, updatedAt"],
        },
      ],
      attributes: {
        exclude: ["createdAt, updatedAt"],
      },
    });

    res.status(200).send({
      status: "success",
      data: findJourney,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "server error",
    });
  }
};

exports.deleteJourneyUser = async (req, res) => {
  try {
    const idUser = req.user.id;
    const idJourney = req.params.id;

    await journey.destroy({
      where: {
        idUser,
        id: idJourney,
      },
    });

    res.status(200).send({
      status: "success",
      data: idJourney,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
    });
    console.log(error);
  }
};

exports.updateJourneyUser = async (req, res) => {
  try {
    const idUser = req.user.id;
    const idJourney = req.params.id;

    await journey.update(
      { ...req.body },
      {
        where: {
          idUser,
          id: idJourney,
        },
      }
    );

    res.status(200).send({
      status: "success update",
      idUser,
      idJourney,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
    });
    console.log(error);
  }
};
