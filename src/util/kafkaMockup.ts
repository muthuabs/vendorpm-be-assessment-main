import { createLogger, format, transports } from 'winston';
// import { Kafka } from 'kafkajs';
import type {
  ConsumerConfig,
  ProducerConfig,
  ProducerRecord,
  KafkaConfig,
  ConsumerSubscribeTopics,
  ConsumerRunConfig,
  EachMessageHandler,
} from 'kafkajs';

interface Events {
  [key: string]: EachMessageHandler[];
}

// Configure the Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }: any) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    // You can also log to a file:
    // new winston.transports.File({ filename: 'eventEmitter.log' })
  ],
});
// const kafkaMockup = function (config: KafkaConfig) {
class KafkaMockup {
  public events: Events;

  constructor(config: KafkaConfig) {
    this.events = {};
  }

  producer(producerData?: ProducerConfig) {
    async function connect() {
      logger.info(`Kafka producer Connection Established`);
    }
    async function disconnect() {
      logger.info(`Kafka producer Connection Disconnected`);
    }

    // Emit an event
    const send = (data: ProducerRecord) => {
      const { topic } = data;

      if (!this.events[topic]) {
        logger.warn(`No subscribers for topic: ${topic}`);
        return new Promise((resolve) => {
          resolve(false);
        });
      }
      logger.info(`Event emitted for topic: ${topic}`);
      const { messages } = data;
      for (let i = 0; i < messages.length; i += 1) {
        const message: any = messages[i];
        this.events[topic].forEach((listener) => {
          return listener(message);
        });
      }
      return new Promise((resolve) => {
        resolve(true);
      });
    };

    return { connect, disconnect, send };
  }

  consumer(consumerData: ConsumerConfig) {
    let topicNames: any = [];
    async function connect() {
      logger.info(`Kafka Consumer Connection Established`);
    }

    const disconnect = async () => {
      for (let i = 0; i < topicNames.length; i += 1) {
        const topicName = topicNames[i];
        if (this.events[topicName]) {
          delete this.events[topicName]; // Remove all listeners for the topic
        }
      }
      logger.info(`Kafka Consumer Connection Disconnected`);
    };

    const subscribe = async (subscribeData: ConsumerSubscribeTopics) => {
      if (Array.isArray(subscribeData.topics)) {
        topicNames = subscribeData.topics;
        for (let i = 0; i < topicNames.length; i += 1) {
          const topicName = topicNames[i];
          if (typeof topicName === 'string') {
            if (!this.events[topicName]) {
              this.events[topicName] = [];
            }
            logger.info(`Listener added for topic: ${topicName}`);
          }
        }

        //   events[topic].push(consumer.run);
      }
    };

    const run = async (subscribeData: ConsumerRunConfig) => {
      if (subscribeData.eachMessage) {
        for (let i = 0; i < topicNames.length; i += 1) {
          const topicName = topicNames[i];
          if (typeof topicName === 'string') {
            this.events[topicName].push(subscribeData.eachMessage);
          }
        }
      }
    };

    return { connect, disconnect, subscribe, run };
  }
}
export default KafkaMockup;
