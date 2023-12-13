import { useCallback, useState } from 'react';
import { JSONCodec, Msg } from 'nats.ws';
import { z } from 'zod';
import { useWidgetConfig } from '../../../lib';
import { useNatsSubscription } from '../../../lib/auth';

import { WidgetConfig } from './index.tsx';

const codec = JSONCodec();

const messageSchema = z.string();

export function SimpleWidget() {
	console.debug('Rendering SimpleWidget');
	const { text } = useWidgetConfig<WidgetConfig>();
	const [state, setState] = useState('[none]');
	const updateState = useCallback((message: Msg) => {
		setState(messageSchema.parse(codec.decode(message.data)));
	}, []);
	useNatsSubscription('test', updateState);

	return (
		<div>
			<h1>Simple Widget</h1>
			<p>{text}</p>
			<p>{state}</p>
		</div>
	);
}
