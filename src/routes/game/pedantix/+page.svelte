<script lang=ts>
    import Header from "$lib/header.svelte";
    let userGuess = "";
    let tabguess: string[] = [];
    let titleWikiPage = "";
    let titleWikiPageSplit: string[] = [];
    let contentsplice: string[] = [];

   async function newGame(){
        titleWikiPage = (await getRandomTitlePage());
        titleWikiPageSplit = titleWikiPage.split(" ");
        contentsplice = await getContentPage(titleWikiPage);
    }

    async function getRandomTitlePage(lang:string = 'fr'): Promise<string>{
       const randomUrl = `https://${lang}.wikipedia.org/w/api.php`;
       const randomParams = new URLSearchParams({
            action: 'query',
            list: 'random',
            rnnamespace: '0', 
            rnlimit: '1',
            format: 'json',
            origin: '*'
        });
         const randomResponse = await fetch(`${randomUrl}?${randomParams}`);
         const randomData = await randomResponse.json();
         const randomTitle: string = randomData.query.random[0].title;
         console.log(randomTitle)
         return randomTitle

    }


    async function getContentPage(titlePage: string,lang:string = 'fr', numLines: number = 40): Promise<string[]>{
         const url = `https://${lang}.wikipedia.org/w/api.php`;
            const params = new URLSearchParams({
                action: 'query',
                titles: titlePage,
                prop: 'extracts',
                exintro: 'false',  
                explaintext: 'true',
                format: 'json',
                origin: '*'
            });

            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];
                
            
            const lines = page.extract.split('\n').filter((line: string) => line.trim() !== '');
            const firstLines = lines.slice(0, numLines);
            return firstLines
    }


</script>
    <Header />
<div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-3xl">
       
        <div class="mb-6">
            <div class="mb-8">
                <h2 class="text-4xl font-bold text-gray-900">Pédantix</h2>
                <p class="text-gray-600 mt-1">Trouvez le mot mystère grâce à la proximité sémantique</p>
                <p class="text-sm text-gray-500 mt-2">NbEssai : </p>
            </div>
        </div>

       
        <div class="relative mb-6">
            <input 
                id="guess" 
                type="text" 
                bind:value={userGuess} 
                placeholder="Tapez votre proposition..."
                class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
        </div>

        
        <div class="mb-6 rounded-lg  p-6">
            <p class="mb-4 text-sm text-gray-600">{titleWikiPageSplit}</p>
            <textarea 
                readonly
                class="h-32 w-full  focus:outline-none"
            >{contentsplice}</textarea>
        </div>

       
        <div class="mb-6 rounded-lg border-2 border-blue-400 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div class="grid grid-cols-2 gap-x-8 gap-y-2">
                {#each tabguess as guess, index}
                    <li class="text-gray-700">
                        <span class="font-medium">{index + 1}.</span> {guess}
                    </li>
                {/each}
            </div>
        </div>


        <div class="flex gap-4">
            <button class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50" on:click={newGame}>
                🔄 Nouvelle partie
            </button>
            <button class="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700">
                📤 Partager résultat
            </button>
        </div>
    </div>
</div>