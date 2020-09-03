import isEmail from 'validator/lib/isEmail';

export function ParseMentions(message: string) {
  let mentions = message.match(/[@]+[A-Za-z0-9_.@]+/g);
  return mentions ? mentions.map(mention => mention.substr(1)).filter(mention => isEmail(mention)) : [];
}
