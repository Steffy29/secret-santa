// Secret Santa - Script Node.js complet
// Installation requise : npm install nodemailer dotenv

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ============================================
// CHARGEMENT DES PARTICIPANTS
// ============================================

function loadParticipants() {
  const participantsPath = path.join(__dirname, 'participants.json');
  
  if (!fs.existsSync(participantsPath)) {
    console.error('❌ ERREUR : Le fichier participants.json est introuvable !');
    console.error('   Créez un fichier participants.json avec le format suivant :');
    console.error(`
   [
     { "name": "Alice Dubois", "email": "alice@example.com" },
     { "name": "Bob Martin", "email": "bob@example.com" },
     { "name": "Claire Bernard", "email": "claire@example.com" }
   ]
    `);
    process.exit(1);
  }

  try {
    const data = fs.readFileSync(participantsPath, 'utf8');
    const participants = JSON.parse(data);
    
    // Validation du format
    if (!Array.isArray(participants) || participants.length === 0) {
      throw new Error('Le fichier doit contenir un tableau de participants');
    }
    
    participants.forEach((p, index) => {
      if (!p.name || !p.email) {
        throw new Error(`Participant ${index + 1} : les champs "name" et "email" sont requis`);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        throw new Error(`Participant ${index + 1} : email invalide (${p.email})`);
      }
    });
    
    return participants;
  } catch (error) {
    console.error('❌ ERREUR lors de la lecture de participants.json :', error.message);
    process.exit(1);
  }
}

// ============================================
// CONFIGURATION EMAIL ET MODE TEST
// ============================================

// Mode test : mettre à true pour ne pas envoyer les emails
const TEST_MODE = process.env.TEST_MODE === 'true' || false;

const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

const organizerName = process.env.ORGANIZER_NAME || 'Le Père Noël';

// ============================================
// VALIDATION DE LA CONFIGURATION
// ============================================

function validateConfig() {
  // En mode test, on ne vérifie pas les identifiants email
  if (TEST_MODE) {
    console.log('🧪 MODE TEST ACTIVÉ - Les emails ne seront pas envoyés\n');
    return;
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ ERREUR : Variables d\'environnement manquantes !');
    console.error('   Assurez-vous que le fichier .env contient :');
    console.error('   - EMAIL_USER');
    console.error('   - EMAIL_PASSWORD');
    console.error('\n   Ou activez le mode test avec TEST_MODE=true dans .env\n');
    process.exit(1);
  }
}

// ============================================
// ALGORITHME DE TIRAGE AU SORT
// ============================================

function performSecretSantaDraw(participants) {
  if (participants.length < 3) {
    throw new Error('Il faut au moins 3 participants pour le Secret Santa');
  }

  let attempts = 0;
  const maxAttempts = 1000;
  let validDraw = false;
  let assignments = [];

  while (!validDraw && attempts < maxAttempts) {
    attempts++;
    assignments = [];
    const givers = [...participants];
    const receivers = [...participants];
    let tempReceivers = [...receivers];
    validDraw = true;

    for (let giver of givers) {
      // Filtrer pour éviter de se tirer soi-même
      const availableReceivers = tempReceivers.filter(r => r.email !== giver.email);
      
      if (availableReceivers.length === 0) {
        validDraw = false;
        break;
      }

      // Tirage aléatoire
      const randomIndex = Math.floor(Math.random() * availableReceivers.length);
      const receiver = availableReceivers[randomIndex];
      
      assignments.push({
        giver: giver,
        receiver: receiver
      });

      // Retirer le receiver de la liste
      tempReceivers = tempReceivers.filter(r => r.email !== receiver.email);
    }
  }

  if (!validDraw) {
    throw new Error('Impossible de réaliser un tirage valide après ' + maxAttempts + ' tentatives');
  }

  console.log(`✅ Tirage réussi en ${attempts} tentative(s)`);
  return assignments;
}

// ============================================
// GÉNÉRATION DU TEMPLATE EMAIL
// ============================================

function generateEmailTemplate(giverName, receiverName) {
  const messages = [
    `Ho ho ho ! J'ai une mission spéciale pour toi, ${giverName} !`,
    `${giverName}, le Père Noël a besoin de ton aide !`,
    `Cher ${giverName}, une mission magique t'attend !`,
    `${giverName}, j'ai consulté ma liste et tu as été choisi(e) !`
  ];

  const closings = [
    'Que la magie de Noël guide ton choix de cadeau ! 🎅',
    'Ho ho ho ! Joyeuses fêtes ! 🎄',
    'Que cette période des fêtes soit remplie de joie ! ⭐',
    'La magie de Noël opère déjà ! 🎁'
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const randomClosing = closings[Math.floor(Math.random() * closings.length)];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Georgia', serif;
          background-color: #f0f4f8;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 50%, #16a34a 100%);
          padding: 4px;
          border-radius: 16px;
        }
        .content {
          background-color: #ffffff;
          border-radius: 14px;
          padding: 0;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 36px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .snowflake {
          color: white;
          font-size: 24px;
          opacity: 0.8;
          position: absolute;
        }
        .body-content {
          padding: 40px 30px;
          background-color: #fefefe;
        }
        .greeting {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 25px;
          font-style: italic;
          text-align: center;
        }
        .secret-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left: 5px solid #f59e0b;
          padding: 25px;
          margin: 30px 0;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .secret-box p {
          margin: 0;
          color: #92400e;
          font-size: 16px;
        }
        .secret-name {
          font-size: 28px;
          font-weight: bold;
          color: #dc2626;
          text-align: center;
          margin: 15px 0 10px 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .reminder {
          background-color: #fee2e2;
          border: 2px dashed #dc2626;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
        }
        .reminder p {
          color: #991b1b;
          margin: 0;
          font-size: 15px;
        }
        .footer {
          background-color: #1e3a8a;
          padding: 30px;
          text-align: center;
          color: white;
        }
        .signature {
          font-size: 24px;
          font-weight: bold;
          margin-top: 15px;
          font-family: 'Brush Script MT', cursive;
        }
        .decoration {
          font-size: 30px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="header">
            <span class="snowflake" style="top: 10px; left: 20px;">❄️</span>
            <span class="snowflake" style="top: 15px; right: 30px;">⭐</span>
            <span class="snowflake" style="bottom: 20px; left: 40px;">✨</span>
            <span class="snowflake" style="bottom: 15px; right: 25px;">❄️</span>
            <h1>🎅 Secret Santa 🎄</h1>
          </div>
          
          <div class="body-content">
            <div class="greeting">
              ${randomMessage}
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
              Cette année, dans l'atelier du Pôle Nord, mes lutins et moi avons organisé 
              un tirage au sort magique. Et devine quoi ? Tu as été sélectionné(e) pour 
              une mission très spéciale ! 🎁
            </p>

            <div class="secret-box">
              <p>🎁 Ta mission, si tu l'acceptes :</p>
              <div class="secret-name">${receiverName}</div>
              <p style="text-align: center; margin-top: 10px;">
                <em>Cette personne attend ton cadeau avec impatience !</em>
              </p>
            </div>

            <div class="reminder">
              <p>
                🤫 <strong>RAPPEL IMPORTANT</strong> 🤫<br>
                Cette information est top secrète !<br>
                Ne révèle à personne le nom que tu as reçu.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 15px; line-height: 1.6; text-align: center; margin-top: 25px;">
              Laisse parler ton imagination et trouve un cadeau qui fera briller 
              les yeux de ${receiverName}. Souviens-toi, ce n'est pas la valeur 
              du cadeau qui compte, mais l'attention et la joie que tu y mets ! ✨
            </p>

            <div class="decoration">
              🎄 🎁 ⭐ 🔔 🎅
            </div>

            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              ${randomClosing}
            </p>
          </div>

          <div class="footer">
            <div class="signature">${organizerName}</div>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
              📮 Directement depuis le Pôle Nord<br>
              🎄 Avec toute la magie de Noël
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// ENVOI DES EMAILS (OU AFFICHAGE EN MODE TEST)
// ============================================

async function sendSecretSantaEmails(assignments, emailConfig, organizerName) {
  if (TEST_MODE) {
    console.log('\n📧 MODE TEST - Aperçu des emails qui seraient envoyés :\n');
    console.log('='.repeat(80));
    
    for (const assignment of assignments) {
      const htmlContent = generateEmailTemplate(
        assignment.giver.name,
        assignment.receiver.name
      );
      
      console.log(`\n📨 Email pour : ${assignment.giver.name} (${assignment.giver.email})`);
      console.log('-'.repeat(80));
      console.log('Sujet : 🎅 Ho Ho Ho ! Votre mission Secret Santa vous attend ! 🎄');
      console.log('-'.repeat(80));
      
      // Conversion HTML en texte pour l'affichage console
      const textVersion = htmlContent
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(textVersion);
      console.log('\n' + '='.repeat(80));
      
      // Optionnel : Sauvegarder le HTML dans un fichier pour visualisation
      const fs = require('fs');
      const fileName = `email_preview_${assignment.giver.name.replace(/\s+/g, '_')}.html`;
      fs.writeFileSync(fileName, htmlContent);
      console.log(`💾 HTML sauvegardé dans : ${fileName}`);
      console.log('='.repeat(80) + '\n');
    }
    
    console.log('✅ Aperçu terminé - Aucun email n\'a été envoyé\n');
    console.log('💡 Astuce : Ouvrez les fichiers .html générés dans un navigateur pour voir le rendu complet');
    return;
  }

  // Mode production : envoi réel des emails
  const transporter = nodemailer.createTransport(emailConfig);

  console.log('\n📧 Envoi des emails en cours...\n');

  for (const assignment of assignments) {
    try {
      const htmlContent = generateEmailTemplate(
        assignment.giver.name,
        assignment.receiver.name
      );

      await transporter.sendMail({
        from: `"${organizerName}" <${emailConfig.auth.user}>`,
        to: assignment.giver.email,
        subject: '🎅 Ho Ho Ho ! Votre mission Secret Santa vous attend ! 🎄',
        html: htmlContent
      });

      console.log(`✅ Email envoyé à ${assignment.giver.name} (${assignment.giver.email})`);
      
      // Pause de 1 seconde entre chaque email pour éviter le spam
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi à ${assignment.giver.name}:`, error.message);
    }
  }

  console.log('\n🎉 Tous les emails ont été traités !\n');
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

async function main() {
  console.log('🎅 ========================================');
  console.log('   SECRET SANTA - Tirage au sort');
  console.log('========================================== 🎄\n');

  try {
    // Validation de la configuration
    validateConfig();

    // Chargement des participants
    const participants = loadParticipants();

    // Affichage des participants
    console.log(`📋 Participants (${participants.length}) :`);
    participants.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.email}`);
    });
    console.log('');

    // Tirage au sort
    console.log('🎲 Réalisation du tirage au sort...');
    const assignments = performSecretSantaDraw(participants);

    // Affichage des résultats (à commenter en production !)
    console.log('\n📊 Résultats du tirage :');
    assignments.forEach(a => {
      console.log(`   ${a.giver.name} → ${a.receiver.name}`);
    });
    console.log('');

    // Confirmation avant envoi
    if (!TEST_MODE) {
      console.log('⚠️  Les emails vont être envoyés. Ctrl+C pour annuler.');
      console.log('   Envoi dans 5 secondes...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Envoi des emails (ou affichage en mode test)
    await sendSecretSantaEmails(assignments, emailConfig, organizerName);

    console.log('✨ Programme terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancement du programme
if (require.main === module) {
  main();
}

module.exports = { performSecretSantaDraw, generateEmailTemplate, loadParticipants };