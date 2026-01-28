class ApiFeatures {
  constructor(queryModel, query) {
    this.query = query;
    this.queryModel = queryModel;
    // 1) FILTERING
  }
  filter() {
    const queryObj = { ...this.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    const queryStr = JSON.stringify(queryObj);
    const parsed = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`),
    );
    // for (let [key, value] of Object.entries(parsed)) {
    //   if (value === 'true' || value === 'false') {
    //     if (value.toLowerCase() === 'true') {
    //       parsed[key] = true;
    //     }
    //     if (value.toLowerCase() === 'false') {
    //       parsed[key] = false;
    //     }
    //   }
    // }
    // console.log(parsed, ' yes');
    this.queryModel = this.queryModel.find(parsed);
    return this;
  }
  sort() {
    if (this.query.sort) {
      const sortBy = String(this.query.sort).split(',').join(' ');
      this.queryModel = this.queryModel.sort(sortBy);
    } else {
      this.queryModel = this.queryModel.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.query.fields) {
      const fields = this.query.fields.split(',').join(' ');
      this.queryModel = this.queryModel.select(fields);
    } else {
      this.queryModel = this.queryModel.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 3;
    const skip = (page - 1) * limit;

    this.queryModel = this.queryModel.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeatures;
