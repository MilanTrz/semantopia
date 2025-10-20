<script lang="ts">
    let isconnected : boolean = false;
   function verifierConnexion() : boolean{
    //to-do faire la logique pour vérifier si la personne est connecter
        return isconnected;
    }
</script>

<nav class="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
    <div class="flex items-center gap-3">
        <img src="/src/lib/assets/logo.png" alt="Logo du site web" width="40" height="40" >
        <h3 class="text-xl font-bold text-gray-800">Sémantopia</h3>
    </div>
    <div>
        <ul class="flex items-center gap-6">
            <li><a href="/login" class="text-gray-600 hover:text-purple-600 transition">Jouer</a></li>
            <li><a href="/login" class="text-gray-600 hover:text-purple-600 transition">A propos</a></li>
            <li><a href="/login" class="text-gray-600 hover:text-purple-600 transition">Profil</a></li>
            <li><button class="text-gray-600 hover:text-purple-600 transition"><a href="/src/routes/login">Se connecter</a></button></li>
            <li><button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"><a href="/src/routes/register">Créer un compte</a></button></li>
        </ul>
    </div>
</nav>

<section class="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-8 py-16">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div class="text-white">
            <h2 class="text-4xl font-bold mb-4">Bienvenue dans <span class="text-yellow-300">Sémantopia</span></h2>
            <p class="text-lg mb-6 leading-relaxed">L'univers fascinant des jeux de mots vous attend ! Développez
                votre vocabulaire, stimulez votre esprit et défiez vos amis
                dans une aventure linguistique unique.
            </p>
            <div class="flex flex-wrap gap-3">
                <button class="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"><a href="/login">Jouer en invité</a></button>
                <button class="bg-white bg-opacity-20 text-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition border border-white"><a href="/login">Se Connecter</a></button>
                <button class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"><a href="/register">Créer un compte</a></button>
            </div>
        </div>
        <div class="bg-purple-700 bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
            <img src="/src/lib/assets/puzzle.png" alt="Logo du site web" width="60" height="60" class="mx-auto mb-4">
            <h3 class="text-2xl font-bold mb-3">Jeux intéractifs</h3>
            <p class="text-purple-100">Découvrez nos 4 jeux uniques conçus pour défier votre intelligence
                linguistique
            </p>
        </div>
    </div>
</section>

<section class="px-8 py-16 bg-gray-50">
    <h2 class="text-3xl font-bold text-center mb-2">🎯Choisissez votre défi</h2>
    <p class="text-gray-600 text-center mb-12">Quatre jeux innovants pour tous les niveaux</p>
    
    <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-6" >
        <a href="/jeux/cemantix" class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition cursor-pointer">
            <div class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
                <div class="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img src="/src/lib/assets/logo_Cémantix.png" alt="Logo du site web" width="40" height="40" >
                </div>
                <h4 class="text-xl font-bold mb-3 text-gray-800">Cémantix</h4>
                <p class="text-gray-600 text-sm">Trouvez le mot mystère grâce
                    aux associations sémantiques
                    et à l'intelligence artificielle
                </p>
        
            </div>
        </a>
        <div class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
             <a href="/jeux/pedantix" class="cursor-pointer">
                <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img src="/src/lib/assets/logo_Pédantix.png" alt="Logo du site web" width="40" height="40" >
                </div>
                <h4 class="text-xl font-bold mb-3 text-gray-800">Pédantix</h4>
                <p class="text-gray-600 text-sm">Découvrez l'article Wikipédia
                    caché mot par mot dans ce jeu
                    de déduction
                </p>
               </a> 
            </div>
        
        
        <div class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
             <a href="/jeux/motix" class="cursor-pointer">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/src/lib/assets/logo_Motix.png" alt="Logo du site web" width="40" height="40" >
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-800">Motix</h4>
            <p class="text-gray-600 text-sm">Créez un maximum de mots
                avec les lettres proposées
                dans le temps imparti
            </p>
            </a>
        </div>
        <div class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
             <a href="/jeux/correlix" class="cursor-pointer">
            <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/src/lib/assets/logo_Correlix.png" alt="Logo du site web" width="40" height="40" >
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-800">Corrélix</h4>
            <p class="text-gray-600 text-sm">Trouvez les mots liés par des
                corrélations surprenantes et
                logiques
            </p>
            </a>
        </div>
    </div>
</section>

<footer class="bg-gray-900 text-white px-8 py-12">
    <div class="max-w-6xl mx-auto flex flex-col items-center text-center gap-4">
        <h3 class="text-2xl font-bold">🏠Sémantopia</h3>
        <p class="text-gray-400 max-w-md">La plateforme de référence pour les
            jeux de mots et défis linguistiques en
            français.
        </p>
        <div class="w-full h-px bg-gray-700 my-4"></div>
        <p class="text-gray-500 text-sm">© 2025 Sémantopia. Tous droits réservés. 🇫🇷 Fièrement français.</p>
    </div>
</footer>