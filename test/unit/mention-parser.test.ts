require('dotenv').config();
import { ParseMentions } from '../../src/utils';

describe('Parse Mentions', () => {
  it('returns mentions', () => {
    const mentions = ParseMentions('test @test@gmail.com @test2@gmail.com');
    expect(mentions).toEqual(expect.arrayContaining(['test@gmail.com']));
    expect(mentions).toEqual(expect.arrayContaining(['test2@gmail.com']));
  });

  it('does not return an invalid email', () => {
    const mentions = ParseMentions('test @test.com');
    expect(mentions.length).toEqual(0);
  });
});

export {}; // because typescript complains for --isolateModules
