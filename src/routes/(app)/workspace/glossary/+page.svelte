<script lang="ts">
	import { onMount } from 'svelte';
	import { WEBUI_API_BASE_URL } from '$lib/constants';
	import Markdown from '$lib/components/chat/Messages/Markdown.svelte';

	let entries: {
		id: string;
		title: string;
		content: string;
		collection: string;
		source: string;
		url?: string;
		author?: string;
		license?: string;
	}[] = [];
	let query = '';
	let collection = 'Workspace';
	let loading = true;
	let error = '';
	$: collections = [...new Set(entries.map((entry) => entry.collection))];
	$: visible = entries.filter(
		(entry) =>
			(!collection || entry.collection === collection) &&
			`${entry.title} ${entry.content}`.toLowerCase().includes(query.trim().toLowerCase())
	);

	onMount(async () => {
		try {
			const response = await fetch(`${WEBUI_API_BASE_URL}/studio/glossary`, {
				headers: { Authorization: `Bearer ${localStorage.token}` }
			});
			if (!response.ok) throw new Error('The glossary could not be loaded.');
			entries = (await response.json()).entries;
		} catch (e) {
			error = e instanceof Error ? e.message : 'The glossary could not be loaded.';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto w-full max-w-4xl py-5 px-2">
	<h1 class="text-2xl font-semibold">Glossary</h1>
	<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
		Workspace concepts and framework terminology, with source attribution.
	</p>
	<div class="flex flex-col sm:flex-row gap-2 my-5">
		<input
			class="flex-1 rounded-xl bg-gray-100 dark:bg-gray-850 px-4 py-2 outline-none"
			type="search"
			placeholder="Search terms and guidance"
			aria-label="Search glossary"
			bind:value={query}
		/>
		<select
			class="rounded-xl bg-gray-100 dark:bg-gray-850 px-3 py-2"
			aria-label="Glossary collection"
			bind:value={collection}
		>
			<option value="">All collections</option>
			{#each collections as name}<option value={name}>{name}</option>{/each}
		</select>
	</div>
	{#if loading}
		<p class="text-sm text-gray-500">Loading glossary…</p>
	{:else if error}
		<p role="alert" class="text-sm text-red-600">{error}</p>
	{:else if visible.length === 0}
		<p class="text-sm text-gray-500">No matching entries in this collection.</p>
	{:else}
		<div class="space-y-3">
			{#each visible as entry (entry.id)}
				<details
					class="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
					open={query.trim().length > 0 || collection === 'Workspace'}
				>
					<summary class="cursor-pointer font-medium">{entry.title}</summary>
					<div class="mt-3 prose dark:prose-invert max-w-none text-sm">
						<Markdown id={`glossary-${entry.id}`} content={entry.content} />
					</div>
					<div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
						{#if entry.url}<a class="underline" href={entry.url} target="_blank" rel="noreferrer"
								>{entry.source}</a
							>{:else}{entry.source}{/if}
						{#if entry.author}
							· {entry.author}{/if}
						{#if entry.license}
							· <a
								class="underline"
								href="https://creativecommons.org/licenses/by-sa/4.0/"
								target="_blank"
								rel="noreferrer">{entry.license}</a
							>{/if}
					</div>
				</details>
			{/each}
		</div>
	{/if}
</div>
