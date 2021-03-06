import Message from '../models/Message';
import Request from '../models/Request';
import User from '../models/User';

class Requests {
  constructor (ctx, next) {
    this.db = ctx.db || null;
    this.ctx = ctx;
    this.next = next;
    this.request = {};
    this.respond = {};
    this.respond.status = null;
    this.respond.body = null;
  }

  async all () {
    let conditions = {};
    if (this.ctx.query.conditions) {
      conditions = JSON.parse(this.ctx.query.conditions);
    }
    const request = await Request.findOne({requestId: this.ctx.params.id});
    conditions.request = request.id;
    const result = await Message.find(conditions).populate('author');
    if (result) {
      this.respond.body = result;
    } else {
      this.respond.body = {message: 'Ошибка'};
    }
    this.respond.status = 200;
  }

  async parseRequest () {
    this.request = (this.ctx.request && this.ctx.request.body) ? this.ctx.request.body : '';
  }

  async create () {
    await this.parseRequest();
    const user = await User.findOne({btxId: this.ctx.passport.user.Id});
    this.request.authorId = this.ctx.passport.user.Id;
    if (user) {
      this.request.author = user._id;
    }
    const request = await Request.findOne({requestId: this.ctx.params.id});
    this.request.request = request._id;
    const message = new Message(this.request);
    const result = await message.save();
    if (result) {
      this.respond.status = 201;
      this.respond.body = {id: result.id};
    } else {
      this.respond.status = 200;
      this.respond.body = {message: 'Ошибка при добавлении заявки'};
    }
  }

  async fields () {
    const result = await this.model().fields(this.ctx.params.code);
    this.respond.status = 200;
    this.respond.body = result;
  }

  response () {
    this.ctx.status = this.respond.status || 500;
    this.ctx.body = this.respond.body || {
      code: this.ctx.status,
      data: {error: 'An internal error has occured'}
    };
    this.ctx.type = 'application/json';
  }
}
module.exports = Requests;
