module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // 更加健壮的正则：
      // 1. (?:(.+?)\s+)?      -> 匹配开头的任意字符（如 Emoji）并紧跟至少一个空格，可选
      // 2. (\w+)              -> 匹配类型（如 feat, fix），必填
      // 3. (?:\((.*)\))?      -> 匹配作用域（如 (network)），可选
      // 4. [\!\:]\s*          -> 匹配冒号或感叹号冒号，以及后面的空格
      // 5. (.*)               -> 匹配主题内容
      headerPattern: /^(?:(.+?)\s+)?(\w+)(?:\((.*)\))?[\!\:]\s*(.*)$/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
  },
};
