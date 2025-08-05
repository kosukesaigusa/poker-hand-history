import { desc, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { todos } from "../../../schema";
import { DEFAULT_USER_IDS } from "../../../util/seed/data/userIds";
import { mockSetUserAuthMiddleware } from "../../../util/test-util/mockSetUserAuthMiddleware";
import {
	getTestClient,
	getTestDrizzleClient,
} from "../../../util/test-util/testClient";
import type { ZodValidationErrorResponse } from "../../../util/test-util/zodValidationErrorResponse";

describe("Test for POST /api/todos", () => {
	// 前提：認証済みユーザーが有効なデータでTodoを作成する。
	// 期待値：ステータスコード 200 と作成されたTodo情報が返される。
	it("Successfully create a new todo", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "テストTodo",
				description: "テスト用のTodoです",
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(200);

		// レスポンスデータを検証する。
		const data = await res.json();
		expect(data).toStrictEqual({
			todo: {
				todoId: expect.any(String),
				userId: DEFAULT_USER_IDS.USER_1,
				title: "テストTodo",
				description: "テスト用のTodoです",
				isCompleted: false,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			},
		});

		// DB の状態を検証する。
		const db = getTestDrizzleClient();
		const results = await db
			.select()
			.from(todos)
			.where(eq(todos.userId, DEFAULT_USER_IDS.USER_1))
			.orderBy(desc(todos.createdAt))
			.all();

		// 新しく作成されたTodoが存在することを確認する。
		expect(results.length).toBeGreaterThan(0);
		const newTodo = results[0];
		expect(newTodo.title).toBe("テストTodo");
		expect(newTodo.description).toBe("テスト用のTodoです");
		expect(newTodo.isCompleted).toBe(false);
	});

	// 前提：認証済みユーザーが説明なしでTodoを作成する。
	// 期待値：ステータスコード 200 と作成されたTodo情報が返される。
	it("Successfully create a new todo without description", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_2 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "説明なしTodo",
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(200);

		// レスポンスデータを検証する。
		const data = await res.json();
		expect(data).toStrictEqual({
			todo: {
				todoId: expect.any(String),
				userId: DEFAULT_USER_IDS.USER_2,
				title: "説明なしTodo",
				description: null,
				isCompleted: false,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			},
		});
	});

	// 前提：認証済みユーザーがタイトルなしでTodoを作成しようとする。
	// 期待値：ステータスコード 400 と Zod バリデーションエラーが返される。
	it("Returns 400 with Zod validation error when title is missing", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			// @ts-expect-error テストの目的で title は意図的に省略している。
			json: {
				description: "タイトルなしのTodo",
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// Zod バリデーションエラーが返されることを確認する。
		const errorResponse = (await res.json()) as ZodValidationErrorResponse;
		expect(errorResponse.success).toBe(false);
		expect(errorResponse.error.name).toBe("ZodError");
	});

	// 前提：認証済みユーザーが空のタイトルでTodoを作成しようとする。
	// 期待値：ステータスコード 400 とエラーコード todos.post.2 が返される。
	it("Returns 400 with error code todos.post.2 when title is empty", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "",
				description: "空のタイトル",
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "todos.post.2",
			},
		});
	});

	// 前提：認証済みユーザーが長すぎるタイトルでTodoを作成しようとする。
	// 期待値：ステータスコード 400 とエラーコード todos.post.2 が返される。
	it("Returns 400 with error code todos.post.2 when title is too long", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "a".repeat(101), // 101文字のタイトル
				description: "長すぎるタイトル",
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "todos.post.2",
			},
		});
	});

	// 前提：認証済みユーザーが長すぎる説明でTodoを作成しようとする。
	// 期待値：ステータスコード 400 とエラーコード todos.post.2 が返される。
	it("Returns 400 with error code todos.post.2 when description is too long", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "普通のタイトル",
				description: "a".repeat(501), // 501文字の説明
			},
		});

		// ステータスコードを検証する。
		expect(res.status).toBe(400);

		// エラーレスポンスを検証する。
		const error = await res.json();
		expect(error).toEqual({
			error: {
				code: "todos.post.2",
			},
		});
	});

	// 前提：未認証ユーザーがTodoを作成しようとする。
	// 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
	it("Returns 400 with error code middleware.auth.1 when user authentication fails", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ userId: undefined });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "テストTodo",
				description: "テスト用のTodoです",
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

	// 前提：認証に失敗したユーザーがTodoを作成しようとする。
	// 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
	it("Returns 400 with error code middleware.auth.1 when firebase auth fails", async () => {
		// ユーザー情報をセットする。
		mockSetUserAuthMiddleware({ shouldFailAuth: true });

		// テスト用の API クライアントを作成する。
		const client = await getTestClient();

		// リクエストを送信する。
		const res = await client.api.todos.$post({
			json: {
				title: "テストTodo",
				description: "テスト用のTodoです",
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
