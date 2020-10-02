declare module '@beyonk/svelte-notifications' {
	type NotifyFunc = (msg: string, timeout?: number) => void;
	type Notifier = {
		send: (
			message: string,
			type: string = 'default',
			timeout: number
		) => void;
		danger: NotifyFunc;
		warning: NotifyFunc;
		info: NotifyFunc;
		success: NotifyFunc;
	};
	export const notifier: Notifier;
	export const NotificationDisplay: any;
}
