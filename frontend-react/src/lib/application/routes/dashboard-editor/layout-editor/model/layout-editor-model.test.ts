import { beforeEach, describe, expect, test } from 'vitest';
import {
	deleteSelected,
	getBounds,
	getWidgetIds,
	LayoutEditorState,
	moveSelected,
	moveSelection,
	resizeSelected,
	selectedWidgetId
} from './layout-editor-model.ts';

let state: LayoutEditorState = {
	layout: [
		['.', '.', '.', 'a', 'a', '.'],
		['.', '.', '.', 'a', 'a', '.'],
		['.', '.', '.', 'b', '.', '.'],
		['.', '.', '.', 'c', 'c', '.'],
		['.', '.', '.', 'c', 'c', '.'],
		['.', '.', '.', '.', '.', '.']
	],
	selection: { x: 3, y: 3 }
};

function layoutToString(layout: string[][]) {
	return layout.map(row => row.join('')).join('\n');
}

beforeEach(() => {
	state = {
		layout: [
			['.', '.', '.', 'a', 'a', '.'],
			['.', '.', '.', 'a', 'a', '.'],
			['.', '.', '.', 'b', '.', '.'],
			['.', '.', '.', 'c', 'c', '.'],
			['.', '.', '.', 'c', 'c', '.'],
			['.', '.', '.', '.', '.', '.']
		],
		selection: { x: 4, y: 4 }
	};
});

describe('getting the selected widget id', () => {
	beforeEach(() => {
		state = {
			...state,
			selection: { x: 3, y: 0 }
		};
	});

	test('widget selected in top left corner', () => {
		const selected = selectedWidgetId(state);
		expect(selected).toEqual('a');
	});

	test('widget selected somewhere in the middle', () => {
		const selected = selectedWidgetId(moveSelection(state, { x: 1, y: 1 }));
		expect(selected).toEqual('a');
	});

	test('no widget selected', () => {
		const selected = selectedWidgetId(moveSelection(state, { x: -3, y: 0 }));
		expect(selected).toEqual(undefined);
	});
});

test('getting a list of widget instance IDs', () => {
	const ids = getWidgetIds(state);
	expect(ids).toEqual(['a', 'b', 'c']);
});

describe('get bounds of a widget instance', () => {
	test('get bounds of a widget instance', () => {
		const bounds = getBounds(state, 'a');
		expect(bounds).toEqual({ x: 3, y: 0, width: 2, height: 2 });
	});

	test('get bounds of a widget instance that does not exist', () => {
		expect(() => getBounds(state, 'd')).toThrow();
	});
});

describe('moving a selection', () => {
	test('moving a selection', () => {
		const moved = moveSelection(state, { x: 1, y: 1 });
		expect(moved.selection).toEqual({ x: 5, y: 5 });
	});

	test('moving a selection out of bounds', () => {
		const moved = moveSelection(state, { x: 10, y: 10 });
		expect(moved.selection).toEqual({ x: 5, y: 5 });
	});
});

describe('deleting a selection', () => {
	test('deleting a widget instance', () => {
		const deleted = deleteSelected(state);
		expect(layoutToString(deleted.layout)).toEqual(
			layoutToString([
				['.', '.', '.', 'a', 'a', '.'],
				['.', '.', '.', 'a', 'a', '.'],
				['.', '.', '.', 'b', '.', '.'],
				['.', '.', '.', '.', '.', '.'],
				['.', '.', '.', '.', '.', '.'],
				['.', '.', '.', '.', '.', '.']
			])
		);
	});

	test('deleting a non-existing selection', () => {
		const deleted = deleteSelected(moveSelection(state, { x: -3, y: -3 }));
		expect(layoutToString(deleted.layout)).toEqual(
			layoutToString(state.layout)
		);
	});
});

describe('moving a widget instance', () => {
	describe('valid movement', () => {
		test('moving a widget instance', () => {
			const moved = moveSelected(state, { x: 1, y: 1 });
			expect(moved.selection).toEqual({ x: 4, y: 4 });
			expect(layoutToString(moved.layout)).toEqual(
				layoutToString([
					['.', '.', '.', 'a', 'a', '.'],
					['.', '.', '.', 'a', 'a', '.'],
					['.', '.', '.', 'b', '.', '.'],
					['.', '.', '.', '.', '.', '.'],
					['.', '.', '.', '.', 'c', 'c'],
					['.', '.', '.', '.', 'c', 'c']
				])
			);
			const movedAgain = moveSelected(moved, { x: -1, y: -1 });
			expect(movedAgain.selection).toEqual({ x: 3, y: 3 });
			expect(layoutToString(movedAgain.layout)).toEqual(
				layoutToString([
					['.', '.', '.', 'a', 'a', '.'],
					['.', '.', '.', 'a', 'a', '.'],
					['.', '.', '.', 'b', '.', '.'],
					['.', '.', '.', 'c', 'c', '.'],
					['.', '.', '.', 'c', 'c', '.'],
					['.', '.', '.', '.', '.', '.']
				])
			);
		});
	});

	describe('movement out of bounds', () => {
		beforeEach(() => {
			state = {
				layout: [
					['a', 'a'],
					['a', 'a']
				],
				selection: { x: 0, y: 0 }
			};
		});
		test('moving out of left bounds', () => {
			const moved = moveSelected(state, { x: -1, y: 0 });
			expect(moved.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(moved.layout)).toEqual(
				layoutToString(state.layout)
			);
		});

		test('moving out of right bounds', () => {
			const moved = moveSelected(state, { x: 1, y: 0 });
			expect(moved.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(moved.layout)).toEqual(
				layoutToString(state.layout)
			);
		});

		test('moving out of top bounds', () => {
			const moved = moveSelected(state, { x: 0, y: -1 });
			expect(moved.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(moved.layout)).toEqual(
				layoutToString(state.layout)
			);
		});

		test('moving out of bottom bounds', () => {
			const moved = moveSelected(state, { x: 0, y: 1 });
			expect(moved.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(moved.layout)).toEqual(
				layoutToString(state.layout)
			);
		});
	});

	describe('movement into another widget', () => {
		beforeEach(() => {
			state = {
				layout: [
					['b', 'a', 'a'],
					['b', 'a', 'a'],
					['c', 'a', 'a']
				],
				selection: { x: 0, y: 0 }
			};
		});
		describe('position conflicts', () => {
			test('moving a widget instance into another widget is impossible', () => {
				const moved = moveSelected(state, { x: 0, y: 1 });
				expect(moved.selection).toEqual({ x: 0, y: 0 });
				expect(layoutToString(moved.layout)).toEqual(
					layoutToString([
						['b', 'a', 'a'],
						['b', 'a', 'a'],
						['c', 'a', 'a']
					])
				);
			});
		});
	});
});

describe('resizing a widget instance', () => {
	beforeEach(() => {
		state = {
			layout: [
				['a', '.', 'b'],
				['a', '.', 'b'],
				['a', '.', 'b']
			],
			selection: { x: 0, y: 0 }
		};
	});

	test('resizing a widget instance', () => {
		const resized = resizeSelected(state, { x: 1, y: 2 });
		expect(resized.selection).toEqual({ x: 0, y: 0 });
		expect(layoutToString(resized.layout)).toEqual(
			layoutToString([
				['a', 'a', 'b'],
				['a', 'a', 'b'],
				['a', 'a', 'b']
			])
		);

		const resizedAgain = resizeSelected(resized, { x: -1, y: -1 });
		expect(resizedAgain.selection).toEqual({ x: 0, y: 0 });
		expect(layoutToString(resizedAgain.layout)).toEqual(
			layoutToString([
				['a', '.', 'b'],
				['a', '.', 'b'],
				['.', '.', 'b']
			])
		);
	});

	describe('resizing a widget instance out of bounds is impossible', () => {
		test('resizing a widget instance out of right bounds', () => {
			state = { ...state, selection: { x: 2, y: 0 } };
			const resized = resizeSelected(state, { x: 1, y: 0 });
			expect(resized.selection).toEqual({ x: 2, y: 0 });
			expect(layoutToString(resized.layout)).toEqual(
				layoutToString(state.layout)
			);
		});

		test('resizing a widget instance out of bottom bounds', () => {
			const resized = resizeSelected(state, { x: 0, y: 1 });
			expect(resized.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(resized.layout)).toEqual(
				layoutToString(state.layout)
			);
		});
	});

	describe('collapsing a widget instance is impossible', () => {
		beforeEach(() => {
			state = {
				layout: [['a']],
				selection: { x: 0, y: 0 }
			};
		});

		test('collapsing a widget instance to 0 width', () => {
			const resized = resizeSelected(state, { x: -1, y: 0 });
			expect(resized.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(resized.layout)).toEqual(
				layoutToString(state.layout)
			);
		});

		test('collapsing a widget instance to 0 height', () => {
			const resized = resizeSelected(state, { x: 0, y: -1 });
			expect(resized.selection).toEqual({ x: 0, y: 0 });
			expect(layoutToString(resized.layout)).toEqual(
				layoutToString(state.layout)
			);
		});
	});

	test('resizing a widget instance into another widget is impossible', () => {
		const resized = resizeSelected(state, { x: 2, y: 0 });
		expect(resized.selection).toEqual({ x: 0, y: 0 });
		expect(layoutToString(resized.layout)).toEqual(
			layoutToString([
				['a', '.', 'b'],
				['a', '.', 'b'],
				['a', '.', 'b']
			])
		);
	});
});
