import { Sequelize, DataTypes, Op } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/data.db',
});
const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  distribution_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  question_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sub_question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  respondent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  skip_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Ensure the table exists before any operations
await sequelize.sync();

export const createResponsesTable = `CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255),
    distribution_name VARCHAR(255),
    created TIMESTAMP,
    category VARCHAR(255),
    question_number VARCHAR(50),
    question_text TEXT,
    sub_question TEXT,
    respondent VARCHAR(255),
    position VARCHAR(255),
    response TEXT,
    comment TEXT,
    version VARCHAR(20)
);`;

export const saveResponse = async (response) => {
  try {
    // Only create if not exists
    const exists = await Response.findByPk(response.id);
    if (!exists) {
      await Response.create(response);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving response:', error, response);
    throw error;
  }
};

export const getResponseById = async (id) => {
  return await Response.findByPk(id);
};

export const deleteResponsesNotVersion = async (
  distribution_name,
  client_name,
  created,
) => {
  if (!distribution_name || !client_name || !created) {
    console.warn('Skipping database clear: missing required field(s):', {
      distribution_name,
      client_name,
      created,
    });
    return;
  }
  const deleted = await Response.destroy({
    where: {
      distribution_name,
      client_name,
      created,
    },
  });
  console.log(`Deleted ${deleted} rows from Responses for`, {
    distribution_name,
    client_name,
    created,
  });
};

export const responseExists = async (id) => {
  const found = await Response.findByPk(id);
  return !!found;
};
