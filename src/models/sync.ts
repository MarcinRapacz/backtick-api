import { Account } from './Account';

// This method fixes the problem with sequelize.sync(), witch not sync models from /models/*
// If you want to sync models, you should add them to this method
// e.g. Models.sync();
const sync = async () => {
  await Promise.all([Account.sync()]);
};

export { sync };
