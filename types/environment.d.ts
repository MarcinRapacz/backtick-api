declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      SEQUELIZE_USERNAME: string;
      SEQUELIZE_PASSWORD: string;
      SEQUELIZE_DATABASE: string;
      SEQUELIZE_HOST: string;
      SEQUELIZE_DIALECT: 'mysql' | 'mariadb' | 'postgres' | 'mssql';
    }
  }
}

export {};
