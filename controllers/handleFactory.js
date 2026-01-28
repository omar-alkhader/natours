const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await model.findByIdAndDelete(id);
    if (!doc) {
      throw new AppError(`no tour found with ${id} id`, 404);
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!newDoc) {
      throw new AppError('no document found with this id', 404);
    }
    res.status(200).json({
      status: 'success',
      doc: newDoc,
    });
  });
exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newDoc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      doc: newDoc,
    });
  });
exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = model.findById(id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
      throw new AppError(`no doc found with ${id} id`, 404);
    }
    res.status(200).json({
      status: 'success',
      doc,
    });
  });
exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    // to allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const docs = await new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination().queryModel;
    if (docs.length === 0) {
      throw new AppError('no docs found', 404);
    }
    res.status(200).json({
      results: docs.length,
      status: 'success',
      docs,
    });
  });
