const Sequelize = require('sequelize');
const moment = require('moment');

const logger = require("./Logger");
const datum = require("./data.json");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const start = async () => {

  try {

    const sequelize = new Sequelize('mysql://root:12345678@localhost:3306/DomRock');

    logger.info(`Successfully connected to MySQL!`);

    class Movimentos extends Sequelize.Model { }

    Movimentos.init({
      item: Sequelize.STRING,
      dt_lancamento: Sequelize.DATE,
      qtd_entrada: Sequelize.DOUBLE,
      valor_entrada: Sequelize.DOUBLE,
      qtd_saida: Sequelize.DOUBLE,
      valor_saida: Sequelize.DOUBLE,
      saldo_inic_qtd: Sequelize.DOUBLE,
      saldo_inic_valor: Sequelize.DOUBLE,
      saldo_final_qtd: Sequelize.DOUBLE,
      saldo_final_valor: Sequelize.DOUBLE
    }, { sequelize, modelName: 'teste', freezeTableName: true, paranoid: true, timestamps: false });

    await sequelize.sync();

    logger.info(`Successfully synced MySQL model!`);

    await asyncForEach(datum, async (item, key) => {

      result = await Movimentos.findAll({
        where: {
          item: item.item
        },
        order: [
          ['dt_lancamento', 'DESC']
        ]
      });

      if (item.tipo_movimento == 'Ent') {
        const s_f_q = parseFloat(result[0].saldo_final_qtd != null ? result[0].saldo_final_qtd : 0) + parseFloat(item.quantidade);
        const s_f_v = parseFloat(result[0].saldo_final_valor != null ? result[0].saldo_final_valor : 0) + parseFloat(item.valor);
        const novoDado = {
          item: item.item,
          dt_lancamento: moment.utc(item.data_lancamento, "DD/MM/YYYY").startOf("day").toDate(),
          qtd_entrada: parseFloat(item.quantidade.replace(',', '.')),
          valor_entrada: parseFloat(item.valor.replace(',', '.')),
          saldo_inic_qtd: result[0].saldo_final_qtd,
          saldo_inic_valor: result[0].saldo_final_valor,
          saldo_final_qtd: s_f_q,
          saldo_final_valor: s_f_v
        }
        // insert to db
        await Movimentos.create(novoDado);
      } else {
        const s_f_q = parseFloat(result[0].saldo_final_qtd != null ? result[0].saldo_final_qtd : 0) - parseFloat(item.quantidade);
        const s_f_v = parseFloat(result[0].saldo_final_valor != null ? result[0].saldo_final_valor : 0) - parseFloat(item.valor);
        const novoDado = {
          item: item.item,
          dt_lancamento: moment.utc(item.data_lancamento, "DD/MM/YYYY").startOf("day").toDate(),
          qtd_saida: parseFloat(item.quantidade.replace(',', '.')),
          valor_saida: parseFloat(item.valor.replace(',', '.')),
          saldo_inic_qtd: result[0].saldo_final_qtd,
          saldo_inic_valor: result[0].saldo_final_valor,
          saldo_final_qtd: s_f_q,
          saldo_final_valor: s_f_v
        }
        // insert to db
        await Movimentos.create(novoDado);
      }

      logger.info(`Successfully inserted ${item.item}`)

    });

    logger.info(`Successfully inserted ${datum.length} items`);

  } catch (e) {
    logger.error(e);
  }

}

start();
