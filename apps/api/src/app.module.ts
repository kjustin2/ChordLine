import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { BandsModule } from './bands/bands.module';
import { EventsModule } from './events/events.module';
import { VenuesModule } from './venues/venues.module';
import { SetlistsModule } from './setlists/setlists.module';
import { SongIdeasModule } from './song-ideas/song-ideas.module';
import { EarningsModule } from './earnings/earnings.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
	imports: [
		PrismaModule,
		UsersModule,
		BandsModule,
		EventsModule,
		VenuesModule,
		SetlistsModule,
		SongIdeasModule,
		EarningsModule,
		NotificationsModule,
	],
})
export class AppModule {}