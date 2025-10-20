<script lang=ts>
    let pseudo = "";
    let email = "";
    let mdp = "";
    let errors: { [key: string]: string } = {};
    let formValidation = true;

    function verificationForm() : boolean{
        errors = {};
        if (!email.match('^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')){
            errors.email = "L'email est incorrecte";
            formValidation = false;
        }
        return formValidation;
    }
    function sendForm(){
        if (!verificationForm()){
            return;
        }
    }
</script>
<div style="background: linear-gradient(135deg, #6B7FED 0%, #8B7BC7 100%); min-height: 100vh;" class="flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center" style="width: 450px; height: 653px;">

        <div class="bg-indigo-500 rounded-full p-4 mb-6">
            <img src="/src/lib/assets/logo.png" alt="Logo du site web" width="40" height="40" class="brightness-0 invert">
        </div>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Connexion à Sémantopia</h2>
        
        <form on:submit|preventDefault={sendForm} class="w-full">

            <div class="mb-5">
                <label for="pseudo" class="block text-sm font-medium text-gray-700 mb-2">
                    Pseudonyme
                </label>
                <input 
                    id="pseudo" 
                    type="text" 
                    bind:value={pseudo} 
                    placeholder="Votre pseudo"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
            </div>

            <div class="mb-5">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                </label>
                <input 
                    id="email" 
                    type="email" 
                    bind:value={email} 
                    placeholder="votre@email.com"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
                {#if errors.email}
                    <p class="text-red-500 text-sm mt-1">{errors.email}</p>
                {/if}
            </div>
            <div class="mb-5">
                <label for="mdp" class="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                </label>
                <div class="relative">
                    <input 
                        id="mdp" 
                        type="password" 
                        bind:value={mdp} 
                        placeholder="••••••••"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-10"
                    />
                </div>
            </div>
            <button 
                type="submit"
                class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md mb-6"
            >
                Créer mon compte
            </button>
        </form>
        <p class="text-sm text-gray-600 text-center mt-auto">
            Vous avez déja un compte ? 
            <a href="/login" class="text-indigo-600 font-semibold hover:underline">
                Se connecter
            </a>
        </p>
    </div>
</div>