import { prisma } from '../utils/PrismaInstance';
import { createMessagesSchema, createMessagesType } from '../schema/game/messages.schema';

export const createMessagesController = async (data: createMessagesType, io: any) => {
  try {

    const validatedData = createMessagesSchema.parse(data);
    const { roomId } = validatedData;

    const isLiveRoom = await prisma.gameRooms.findFirst({
      where: { id: roomId, status: { in: ['live', 'created'] } },
    });

    if (!isLiveRoom) {
      return;
    }

    io.to(roomId).emit('receive_message', validatedData);
  } catch (error) {
    console.log('Data:', data);
    console.log('Error processing message:', error);
  }
};
