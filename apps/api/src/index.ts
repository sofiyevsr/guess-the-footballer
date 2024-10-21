import app from "./app";
import { scheduled } from "./scheduler";

export { ArenaRoom } from "./storage/room.do";

export default {
	fetch: app.fetch,
	scheduled,
};
