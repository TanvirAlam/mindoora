import { pool } from '../utils/PrismaInstance';
import { createMessagesSchema, createMessagesType } from '../schema/game/messages.schema';

export const createMessagesController = async (data: createMessagesType, io: any) => {
  try {

    const validatedData = createMessagesSchema.parse(data);
    const { roomId } = validatedData;

    const { rows } = await pool.query(
      'SELECT id FROM gameRooms WHERE id = $1 AND status IN ($2, $3)',
      [roomId, 'live', 'created']
    );
    const isLiveRoom = rows[0];

    if (!isLiveRoom) {
      return;
    }

    io.to(roomId).emit('receive_message', validatedData);
  } catch (error) {
    console.log('Data:', data);
    console.log('Error processing message:', error);
  }
};
