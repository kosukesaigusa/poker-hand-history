import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { todos } from "../../../schema";
import { TODO_SEED_DATA } from "../../../util/seed/data/todoData";
import { DEFAULT_USER_IDS } from "../../../util/seed/data/userIds";
import { mockSetUserAuthMiddleware } from "../../../util/test-util/mockSetUserAuthMiddleware";
import {
	getTestClient,
	getTestDrizzleClient,
} from "../../../util/test-util/testClient";
import type { ZodValidationErrorResponse } from "../../../util/test-util/zodValidationErrorResponse";

describe("Test for PATCH /api/todos/:todoId/status", () => {
	// 前提：認証済みユーザーが自分のTodoの完了状態を更新する。
	// 期待値：ステータスコード 200 と更新されたTodo情報が返される。
	it("Successfully update todo status to completed", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// USER_1の最初のTodoのIDを取得する。
		const user1Todo = TODO_SEED_DATA.find(
			(todo) => todo.userId === DEFAULT_USER_IDS.USER_1 && !todo.isCompleted,
		);
		if (!user1Todo) {
			throw new Error("USER_1の未完了Todoが見つかりませんでした");
		}

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: user1Todo.todoId },
			json: {
				isCompleted: true,
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(200);

		// レスポンスデータを検証する。
		const data = await res.json();
		expect(data).toStrictEqual({
			todo: {
				todoId: user1Todo.todoId,
				userId: DEFAULT_USER_IDS.USER_1,
				title: user1Todo.title,
				description: user1Todo.description,
				isCompleted: true,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			},
		});

		// DB の状態を検証する。
		const db = getTestDrizzleClient();
		const updatedTodo = await db
			.select()
			.from(todos)
			.where(eq(todos.todoId, user1Todo.todoId))
			.get();

		// Todoが完了状態に更新されていることを確認する。
		expect(updatedTodo?.isCompleted).toBe(true);
	});

	// 前提：認証済みユーザーが自分のTodoの完了状態を未完了に戻す。
	// 期待値：ステータスコード 200 と更新されたTodo情報が返される。
	it("Successfully update todo status to not completed", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// USER_1の完了済みTodoのIDを取得する。
		const user1CompletedTodo = TODO_SEED_DATA.find(
			(todo) => todo.userId === DEFAULT_USER_IDS.USER_1 && todo.isCompleted,
		);
		if (!user1CompletedTodo) {
			throw new Error("USER_1の完了済みTodoが見つかりませんでした");
		}

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: user1CompletedTodo.todoId },
			json: {
				isCompleted: false,
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(200);

		// レスポンスデータを検証する。
		const data = await res.json();
		expect(data).toStrictEqual({
			todo: {
				todoId: user1CompletedTodo.todoId,
				userId: DEFAULT_USER_IDS.USER_1,
				title: user1CompletedTodo.title,
				description: user1CompletedTodo.description,
				isCompleted: false,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			},
		});

		// DB の状態を検証する。
		const db = getTestDrizzleClient();
		const updatedTodo = await db
			.select()
			.from(todos)
			.where(eq(todos.todoId, user1CompletedTodo.todoId))
			.get();

		// Todoが未完了状態に更新されていることを確認する。
		expect(updatedTodo?.isCompleted).toBe(false);
	});

	// 前提：認証済みユーザーが存在しないTodoの完了状態を更新しようとする。
	// 期待値：ステータスコード 400 とエラーコード todos.patch.1 が返される。
	it("Returns 400 with error code todos.patch.1 when todo does not exist", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: "non-existent-todo-id" },
			json: {
				isCompleted: true,
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "todos.patch.1",
			},
		});
	});

	// 前提：認証済みユーザーが他のユーザーのTodoの完了状態を更新しようとする。
	// 期待値：ステータスコード 400 とエラーコード todos.patch.1 が返される。
	it("Returns 400 with error code todos.patch.1 when trying to update another users todo", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// USER_2のTodoのIDを取得する。
		const user2Todo = TODO_SEED_DATA.find(
			(todo) => todo.userId === DEFAULT_USER_IDS.USER_2,
		);
		if (!user2Todo) {
			throw new Error("USER_2のTodoが見つかりませんでした");
		}

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: user2Todo.todoId },
			json: {
				isCompleted: true,
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "todos.patch.1",
			},
		});
	});


	// 前提：認証済みユーザーがisCompletedなしでリクエストを送信する。
	// 期待値：ステータスコード 400 と Zod バリデーションエラーが返される。
	it("Returns 400 with Zod validation error when isCompleted is missing", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// USER_1のTodoのIDを取得する。
		const user1Todo = TODO_SEED_DATA.find(
			(todo) => todo.userId === DEFAULT_USER_IDS.USER_1,
		);
		if (!user1Todo) {
			throw new Error("USER_1のTodoが見つかりませんでした");
		}

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: user1Todo.todoId },
			// @ts-expect-error テストの目的で isCompleted は意図的に省略している。
			json: {},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// Zod バリデーションエラーが返されることを確認する。
		const errorResponse = (await res.json()) as ZodValidationErrorResponse;
		expect(errorResponse.success).toBe(false);
		expect(errorResponse.error.name).toBe("ZodError");
	});

	// 前提：未認証ユーザーがTodoの完了状態を更新しようとする。
	// 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
	it("Returns 400 with error code middleware.auth.1 when user authentication fails", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: undefined });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// USER_1のTodoのIDを取得する。
		const user1Todo = TODO_SEED_DATA.find(
			(todo) => todo.userId === DEFAULT_USER_IDS.USER_1,
		);
		if (!user1Todo) {
			throw new Error("USER_1のTodoが見つかりませんでした");
		}

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: user1Todo.todoId },
			json: {
				isCompleted: true,
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "middleware.auth.1",
			},
		});
	});

	// 前提：認証に失敗したユーザーがTodoの完了状態を更新しようとする。
	// 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
	it("Returns 400 with error code middleware.auth.1 when firebase auth fails", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ shouldFailAuth: true });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// USER_1のTodoのIDを取得する。
		const user1Todo = TODO_SEED_DATA.find(
			(todo) => todo.userId === DEFAULT_USER_IDS.USER_1,
		);
		if (!user1Todo) {
			throw new Error("USER_1のTodoが見つかりませんでした");
		}

		// リクエストを送信する。
		const res = await client.api.todos[":todoId"].status.$patch({
			param: { todoId: user1Todo.todoId },
			json: {
				isCompleted: true,
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "middleware.auth.1",
			},
		});
	});
});
