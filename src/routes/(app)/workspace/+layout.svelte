<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';
	import { WEBUI_NAME, config, showSidebar, user, mobile, workspaceActions } from '$lib/stores';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Sidebar from '$lib/components/icons/Sidebar.svelte';
	import SplitCreateButton from '$lib/components/common/SplitCreateButton.svelte';

	const i18n = getContext<Writable<i18nType>>('i18n');

	let loaded = false;
	let lastPath = '';
	let activeWorkspaceSection = '';
	let visibleActions = [];

	$: if ($page.url.pathname !== lastPath) {
		lastPath = $page.url.pathname;
		workspaceActions.set([]);
	}

	$: activeWorkspaceSection = $page.url.pathname.split('/')[2] ?? '';
	$: visibleActions = $workspaceActions.filter((action) => action.visible ?? true);

	onMount(async () => {
		if ($user?.role !== 'admin') {
			if ($page.url.pathname.includes('/models') && !$user?.permissions?.workspace?.models) {
				goto('/', { replaceState: true });
			} else if (
				$page.url.pathname.includes('/knowledge') &&
				!$user?.permissions?.workspace?.knowledge
			) {
				goto('/', { replaceState: true });
			} else if (
				$page.url.pathname.includes('/prompts') &&
				!$user?.permissions?.workspace?.prompts
			) {
				goto('/', { replaceState: true });
			} else if (
				$page.url.pathname.includes('/tools') &&
				(!$config?.features?.enable_plugins || !$user?.permissions?.workspace?.tools)
			) {
				goto('/', { replaceState: true });
			} else if ($page.url.pathname.includes('/skills') && !$user?.permissions?.workspace?.skills) {
				goto('/', { replaceState: true });
			}
		}

		loaded = true;
	});
</script>

<svelte:head>
	<!-- LICENSE covers this Open WebUI browser-title identifier.
	Do not alter, remove, obscure, or replace it except as LICENSE permits:
	https://docs.openwebui.com/license. -->
	<title>
		{$i18n.t('Workspace')} / {$WEBUI_NAME}
	</title>
</svelte:head>

{#if loaded}
	<div
		class="flex flex-col flex-1 min-w-0 w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar
			? 'md:max-w-[calc(100%-var(--sidebar-width))]'
			: 'md:max-w-[calc(100%-42px)]'} max-w-full"
	>
		<nav class="pb-1 px-2.5 pt-2 backdrop-blur-xl drag-region select-none">
			<div class="flex items-center gap-0.5 md:gap-1">
				{#if $mobile}
					<div class="{$showSidebar ? 'md:hidden' : ''} self-center flex flex-none items-center">
						<Tooltip
							content={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}
							interactive={true}
						>
							<button
								id="sidebar-toggle-button"
								class=" cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition cursor-"
								aria-label={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}
								on:click={() => {
									showSidebar.set(!$showSidebar);
								}}
							>
								<div class=" self-center p-1.5">
									<Sidebar className="size-4" />
								</div>
							</button>
						</Tooltip>
					</div>
				{/if}

				<div class="flex w-full items-center">
					<div
						class="flex min-w-0 mr-1.5 items-center gap-0.5 md:gap-1 scrollbar-none overflow-x-auto w-fit text-center text-sm font-normal rounded-full bg-transparent py-1 touch-auto pointer-events-auto"
					>
						{#if $user?.role === 'admin' || $user?.permissions?.workspace?.models}
							<a
								draggable="false"
								aria-current={activeWorkspaceSection === 'models' ? 'page' : null}
								class="min-w-fit px-1 text-sm inline-flex items-center gap-1 {activeWorkspaceSection ===
								'models'
									? 'text-gray-900 dark:text-gray-100'
									: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
								href="/workspace/models"
							>
								<span>{$i18n.t('Models')}</span>
							</a>
						{/if}

						{#if $user?.role === 'admin' || $user?.permissions?.workspace?.knowledge}
							<a
								draggable="false"
								aria-current={activeWorkspaceSection === 'knowledge' ? 'page' : null}
								class="min-w-fit px-1 text-sm inline-flex items-center gap-1 {activeWorkspaceSection ===
								'knowledge'
									? 'text-gray-900 dark:text-gray-100'
									: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
								href="/workspace/knowledge"
							>
								<span>{$i18n.t('Knowledge')}</span>
							</a>
						{/if}

						{#if $user?.role === 'admin' || $user?.permissions?.workspace?.prompts}
							<a
								draggable="false"
								aria-current={activeWorkspaceSection === 'prompts' ? 'page' : null}
								class="min-w-fit px-1 text-sm inline-flex items-center gap-1 {activeWorkspaceSection ===
								'prompts'
									? 'text-gray-900 dark:text-gray-100'
									: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
								href="/workspace/prompts"
							>
								<span>{$i18n.t('Prompts')}</span>
							</a>
						{/if}

						{#if $user?.role === 'admin' || $user?.permissions?.workspace?.skills}
							<a
								draggable="false"
								aria-current={activeWorkspaceSection === 'skills' ? 'page' : null}
								class="min-w-fit px-1 text-sm inline-flex items-center gap-1 {activeWorkspaceSection ===
								'skills'
									? 'text-gray-900 dark:text-gray-100'
									: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
								href="/workspace/skills"
							>
								<span>{$i18n.t('Skills')}</span>
							</a>
						{/if}

						{#if $config?.features?.enable_plugins && ($user?.role === 'admin' || $user?.permissions?.workspace?.tools)}
							<a
								draggable="false"
								aria-current={activeWorkspaceSection === 'tools' ? 'page' : null}
								class="min-w-fit px-1 text-sm inline-flex items-center gap-1 {activeWorkspaceSection ===
								'tools'
									? 'text-gray-900 dark:text-gray-100'
									: 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition select-none"
								href="/workspace/tools"
							>
								<span>{$i18n.t('Tools')}</span>
							</a>
						{/if}
					</div>

					<a
						href="/workspace/glossary"
						aria-current={activeWorkspaceSection === 'glossary' ? 'page' : null}
						class="shrink-0 px-2 text-sm {activeWorkspaceSection === 'glossary'
							? 'text-gray-900 dark:text-gray-100'
							: 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}">Glossary</a
					>
					<div class="ml-auto flex shrink-0 items-center gap-1">
						<SplitCreateButton actions={visibleActions} />
					</div>
				</div>

				<!-- <div class="flex items-center text-xl font-normal">{$i18n.t('Workspace')}</div> -->
			</div>
		</nav>

		<div
			class="  pb-1 px-3 flex-1 min-w-0 max-h-full overflow-y-auto overflow-x-hidden"
			id="workspace-container"
		>
			<slot />
		</div>
	</div>
{/if}
