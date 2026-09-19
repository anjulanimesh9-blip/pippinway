import type { InteractiveStory } from "./types";
import { validateInteractiveStory } from "./validate";

export const THE_LAST_WITNESS_SLUG = "the-last-witness";
export const THE_LAST_WITNESS_IMAGE_DIR = "/images/vibe/stories/the-last-witness";

function sceneImage(id: string) {
  return `${THE_LAST_WITNESS_IMAGE_DIR}/${id}.webp`;
}

export const THE_LAST_WITNESS: InteractiveStory = {
  id: THE_LAST_WITNESS_SLUG,
  slug: THE_LAST_WITNESS_SLUG,
  title: "The Last Witness",
  subtitle: "An interactive crime thriller",
  introduction:
    "Read in the first person. At the end of each scene, choose what I do and tap the linked scene number. Different decisions lead through different routes and two distinct conclusions.",
  coverImageUrl: sceneImage("01"),
  coverImagePath: "",
  startSceneId: "01",
  published: true,
  scenes: [
    {
      id: "01",
      title: "The Photograph",
      time: "10:38 p.m.",
      location: "The old warehouse",
      imageUrl: sceneImage("01"),
      isEnding: false,
      text: `I leave work late, with tired feet and a phone showing six percent battery. The main road is jammed, so I take the narrow lane behind the abandoned warehouse. I have used it before in daylight. Tonight, two streetlights are dead, and thunder rolls over the rooftops.

Voices stop me. Beside a black car, a man in a white shirt holds out an envelope. “I brought the money,” he says. “What else do you want?”

The other man stands with his back to me. “You should have kept quiet.” The man in white shakes his head. “I am going to the police.”

I decide to turn around. A gunshot cracks through the lane before I can move. The man in white collapses. I duck behind a wall, pressing a hand over my mouth. The shooter searches the fallen man’s pockets, takes his phone, and heads toward the car.

I could run. Instead I lift my phone and photograph the number plate. CLICK. I forgot to silence the camera. The shooter freezes. “Who is there?” His footsteps turn toward my wall. Five percent battery. The warehouse door stands ajar beside me. I have seconds to decide.`,
      choices: [
        {
          id: "A",
          label: "Stay hidden and call the police",
          destinationId: "03",
        },
        {
          id: "B",
          label: "Retreat down the lane and run",
          destinationId: "04",
        },
        {
          id: "C",
          label: "Slip through the warehouse door",
          destinationId: "02",
        },
      ],
    },
    {
      id: "02",
      title: "Inside the Dark",
      time: "10:40 p.m.",
      location: "Warehouse interior",
      imageUrl: sceneImage("02"),
      isEnding: false,
      arriveFrom: {
        "03":
          "I wait until the shooter looks toward the warehouse, then slip through the metal door. The muted emergency call still buzzes faintly against my ribs.",
      },
      text: `“I know you are there!” The voice is getting closer. I ease through the half-open metal door. Its hinge squeals. I catch it before it slams, but a bent piece of iron prevents it from closing completely. Dust and rainwater smell sharp in the dark.

Crates tower around me. A green EXIT sign glows twenty metres away, beyond an exposed strip of floor. The outside door bangs open. I drop between two crates as the shooter sweeps his phone torch across the room. Its light passes inches from my shoe.

His phone rings. “It is done,” he says. “Someone took a picture. I will find them.” I glance at my screen: four percent. The plate photograph is still there. He walks toward the opposite wall, giving me a moment to move.

“Psst.” I turn. A young man crouches behind the crates, blood trickling from a cut on his forehead. “You saw it too?” he whispers. “I have evidence. I know another way out.” Before I can answer, the shooter calls, “Both of you, come out!” How does he know there are two of us?`,
      choices: [
        {
          id: "A",
          label: "Follow the injured stranger",
          destinationId: "05",
        },
        {
          id: "B",
          label: "Throw a bolt as a distraction and rush to EXIT",
          destinationId: "06",
        },
        {
          id: "C",
          label: "Send the plate photograph to emergency services",
          destinationId: "07",
        },
      ],
    },
    {
      id: "03",
      title: "The Call",
      time: "10:40 p.m.",
      location: "Behind the wall",
      imageUrl: sceneImage("03"),
      isEnding: false,
      text: `I crouch so low my knees scrape the concrete and dial the emergency number. I whisper the lane name and tell the operator I have witnessed a shooting. “Stay on the line,” she says. I try to describe the black car, but the shooter’s shoes scrape just beyond the wall.

“I can hear you,” he says. My stomach drops. I mute the call and slide my phone beneath my jacket. The operator’s voice is a faint buzz against my ribs. The shooter passes the gap, looking toward the warehouse. He has not seen me yet.

I photograph the alley sign and send my location while the connection holds. A message appears: LOCATION RECEIVED. Then the battery falls to three percent. The operator tells me officers are being dispatched, but cannot promise how soon they will arrive.

At the far end of the lane a delivery cyclist stops, startled by the gunshot. If I shout, I might warn him—or give myself away. The warehouse door is also within reach.`,
      choices: [
        {
          id: "A",
          label: "Warn the cyclist and run toward the main road",
          destinationId: "08",
        },
        {
          id: "B",
          label: "Enter the warehouse while the shooter looks away",
          destinationId: "02",
        },
      ],
    },
    {
      id: "04",
      title: "The Wrong Turn",
      time: "10:40 p.m.",
      location: "Service lane",
      imageUrl: sceneImage("04"),
      isEnding: false,
      text: `I back away from the wall, one careful step at a time. Then a loose bottle crunches beneath my heel. “Stop!” the shooter shouts. I sprint. The lane seems twice as long as it did on the way in.

Behind me, a car engine starts. The black car swings around the corner, headlights flooding the puddles. I dart through a narrow gap between a locked shop and a fence. The car cannot follow, but footsteps can.

I reach a junction. To my left is a lit petrol station with a security guard. To my right, a pedestrian bridge over the railway leads toward home. My phone shows four percent. I still have the number-plate photo, and the killer has seen which way I ran.

A horn sounds behind me. I have no time to study the roads. I have to choose a direction now.`,
      choices: [
        {
          id: "A",
          label: "Run to the petrol station and ask for help",
          destinationId: "08",
        },
        {
          id: "B",
          label: "Take the railway bridge and try to get home",
          destinationId: "09",
        },
      ],
    },
    {
      id: "05",
      title: "The Stranger’s Evidence",
      time: "10:44 p.m.",
      location: "Warehouse loading bay",
      imageUrl: sceneImage("05"),
      isEnding: false,
      arriveFrom: {
        "07":
          "The plate photograph is already with emergency services. I stay low and follow the injured stranger toward the maintenance hatch.",
      },
      text: `“Show me the way,” I whisper. The injured stranger introduces himself as Nalin. He says he works nights maintaining the warehouse cameras. When he heard an argument, he checked a monitor and saw the shooting. The attacker caught him trying to save the recording.

Nalin leads me between shelves, avoiding a patch of broken glass. He pulls a memory card from his sock. “The camera records faces,” he says. “Your photo records the car. We need both.” I want to trust him, but he has not explained why the killer knew we were together.

We reach a maintenance hatch. Nalin says it opens into the drainage passage behind the building. Then his phone lights up with a message. I glimpse the sender: BOSS. “Have you found the witness?” it reads. Nalin sees me looking. “My supervisor is involved,” he says quickly. “I have been pretending to help them so I could get the footage.” From the warehouse comes a metallic crash. The shooter has found our trail. Nalin holds out the memory card. “Take this, whether you trust me or not.”`,
      choices: [
        {
          id: "A",
          label: "Take the card and escape through the hatch with Nalin",
          destinationId: "10",
        },
        {
          id: "B",
          label: "Take the card but separate from Nalin",
          destinationId: "06",
        },
      ],
    },
    {
      id: "06",
      title: "The Exit Door",
      time: "10:45 p.m.",
      location: "Rear loading yard",
      imageUrl: sceneImage("06"),
      isEnding: false,
      arriveFrom: {
        "05":
          "I take the memory card and break away from Nalin, heading for the glowing EXIT. A loose bolt is the only distraction I can reach.",
        "07":
          "The confirmation is sent. While the killer searches the wrong row, I break for the EXIT, grabbing a metal bolt as I go.",
      },
      text: `I fling a metal bolt across the warehouse. It clatters into a rack. The shooter turns toward the noise, and I race across the open floor. I hit the EXIT bar with my shoulder. The door sticks, then bursts outward into cold rain.

I stumble into a loading yard enclosed by chain-link fencing. A gate stands open at the far end. As I run, I hear someone else burst through the door. It is the injured young man, clutching his side. “Wait! I have the footage!” he calls.

The shooter appears in the doorway behind him. I cannot tell whether the stranger is a victim or a trap. My phone drops to two percent. The photograph is still stored, but I have not backed it up.

A delivery van approaches on the street beyond the gate. Its driver slows at the sight of us. I could ask him to call the police, or I could stay and help the stranger reach safety.`,
      choices: [
        {
          id: "A",
          label: "Reach the van and get the driver to call police",
          destinationId: "08",
        },
        {
          id: "B",
          label: "Help the stranger through the gate",
          destinationId: "10",
        },
      ],
    },
    {
      id: "07",
      title: "Message Sent",
      time: "10:44 p.m.",
      location: "Between the crates",
      imageUrl: sceneImage("07"),
      isEnding: false,
      text: `I open the emergency messaging screen with shaking fingers. I attach the number-plate photograph and type: SHOOTING. OLD WAREHOUSE SERVICE LANE. SUSPECT ARMED. I press send. The loading circle spins while footsteps draw nearer.

SENT. A confirmation arrives just before my battery falls to three percent. I switch off the screen and slide the phone into my pocket. The injured young man beside me whispers, “I have a camera recording. I can get it to you.”

The shooter stops on the other side of our crates. His phone rings. “The witness sent something,” a voice says loudly enough for me to hear. “Find the phone.” Someone is monitoring the situation. It is no longer just one man.

The stranger points to a maintenance hatch behind us. I can follow him, or make for the exit while the killer searches the wrong row.`,
      choices: [
        {
          id: "A",
          label: "Follow the stranger toward the maintenance hatch",
          destinationId: "05",
        },
        {
          id: "B",
          label: "Make a break for the exit",
          destinationId: "06",
        },
      ],
    },
    {
      id: "08",
      title: "Under the Lights",
      time: "10:49 p.m.",
      location: "Petrol station",
      imageUrl: sceneImage("08"),
      isEnding: false,
      arriveFrom: {
        "03":
          "I shout a warning to the cyclist and run toward the main road, lungs burning, until the petrol station lights appear.",
        "06":
          "The van driver hears enough to call the police and get me off the dark yard. He leaves me at the nearest open lights — a petrol station.",
        "09":
          "I ask everyone at the tea stall to stay with me. Together we leave the bridge for the nearest bright, public place — the petrol station still open below.",
      },
      text: `I reach the bright petrol station and shout for the security guard. He ushers me behind the counter as I tell him about the shooting. The delivery cyclist arrives seconds later, breathless, and says he saw the black car turn away.

The guard calls the police on the station landline. I show him the photograph before my phone dies. He writes the registration on a receipt and hands it back to me. For the first time tonight, I am not alone.

Then a dark sedan pulls up across the road. It is not the same car, but the driver keeps watching the station. The guard locks the front door. A police dispatcher calls back and asks whether I can identify the shooter. I never saw his face clearly.

On the station’s security monitor, I notice something: the sedan’s driver is wearing the same distinctive silver watch I glimpsed on the shooter’s wrist. The guard says a patrol is minutes away. Do I wait safely, or ask him to preserve the station’s footage right now?`,
      choices: [
        {
          id: "A",
          label: "Stay inside and give the police everything I know",
          destinationId: "11",
        },
        {
          id: "B",
          label: "Ask the guard to save the station footage before it is overwritten",
          destinationId: "10",
        },
      ],
    },
    {
      id: "09",
      title: "The Bridge",
      time: "10:51 p.m.",
      location: "Railway footbridge",
      imageUrl: sceneImage("09"),
      isEnding: false,
      text: `I climb the pedestrian bridge two steps at a time. Below, the black car crawls along the road, looking for me. The bridge leads to my neighbourhood, but I suddenly realise that going straight home might lead the killer to my family.

I stop beneath a flickering lamp. My phone shows two percent. A message arrives from an unknown number: WE KNOW WHERE YOU LIVE. I cannot tell if it is a bluff. The photograph on my phone feels like a weight in my pocket.

At the far end of the bridge, a late-night tea stall is still open. Two customers sit beside a radio. Behind me, a man steps onto the bridge and begins walking in my direction. I cannot see his face in the glare.

I have to decide whether to seek witnesses at the tea stall or take a side staircase to the police outpost near the bus depot.`,
      choices: [
        {
          id: "A",
          label: "Run to the tea stall and ask everyone to stay with me",
          destinationId: "08",
        },
        {
          id: "B",
          label: "Take the staircase toward the police outpost",
          destinationId: "11",
        },
      ],
    },
    {
      id: "10",
      title: "Two Pieces of Proof",
      time: "10:54 p.m.",
      location: "Drainage passage / street",
      imageUrl: sceneImage("10"),
      isEnding: false,
      arriveFrom: {
        "06":
          "I pull the injured stranger through the gate. We cut behind the yard and drop into a narrow service passage, both pieces of proof still with us.",
        "08":
          "The guard starts saving the station footage. I still need the other witness and his recording. I find Nalin near the warehouse service passage, memory card in hand.",
      },
      text: `Nalin and I emerge into a narrow service passage behind the warehouse. He finally shows me the recording on a small backup device. The camera captured the shooter’s face, but only for a moment. I recognise the silver watch from the alley. Nalin tells me the victim was an accountant who had uncovered false invoices.

“I did not know they would kill him,” Nalin says. His voice cracks. “My supervisor told me to erase the footage. I copied it instead.” I ask why the shooter knew there were two witnesses. Nalin admits his supervisor saw him on the security system and called the attacker. The explanation fits, but I still do not know if Nalin has told me everything.

We reach a road with passing vehicles. My phone dies. I hold the dead device tightly: the original plate photo is still inside. Nalin has the memory card. If we split up, either piece of evidence could disappear. Across the road is a police outpost. Behind us, a car turns into the service passage. Nalin says, “We go together. Now.” I look at the outpost and make my final decision.`,
      choices: [
        {
          id: "A",
          label: "Enter the police outpost together and surrender both pieces of evidence",
          destinationId: "11",
        },
        {
          id: "B",
          label: "Hide the memory card and confront the approaching driver",
          destinationId: "12",
        },
      ],
    },
    {
      id: "11",
      title: "The Last Witness Speaks",
      time: "11:07 p.m.",
      location: "Police outpost",
      imageUrl: sceneImage("11"),
      isEnding: true,
      arriveFrom: {
        "08":
          "A patrol reaches the petrol station. The officers take me to the nearby outpost to record everything I know.",
        "09":
          "I take the staircase off the bridge and keep moving until the police outpost comes into view. Nalin is not with me.",
      },
      text: `I step into the police outpost and tell the duty officer that I witnessed a murder. My voice trembles, but I give him the time, the warehouse location, and the registration number. When Nalin is with me, he hands over the memory card as well. When he is not, I explain where the other witness was last seen.

The officers secure the evidence and dispatch a team to the warehouse. I insist that the recording and the photograph be logged separately. The officer asks me to describe only what I actually saw, not what I guessed. I tell him about the white shirt, the gunshot, the stolen phone, and the silver watch.

At 11:32 p.m., an officer returns with news: the victim has been found, the scene is secured, and investigators are tracing the vehicle. They have not yet caught everyone involved. I am asked to remain available as a witness and to avoid going home alone tonight.

I sit beneath the station’s fluorescent lights with a cup of untouched tea. My hands are finally still. I cannot undo what happened in the lane. But I did not let the only proof disappear. When morning comes, I will have to tell my family why I never made it home.`,
      choices: [],
    },
    {
      id: "12",
      title: "The Price of a Risk",
      time: "10:56 p.m.",
      location: "Service passage",
      imageUrl: sceneImage("12"),
      isEnding: true,
      text: `I slip the memory card beneath a loose brick and step toward the approaching car. “I have what you want!” I shout, hoping to buy Nalin time to escape. The car stops. A man gets out, his face hidden by the open door.

“Give me the recording,” he says. I realise he has no idea where I hid it. Behind him, Nalin quietly retreats toward the main road. I keep talking, forcing the man to look at me instead of Nalin.

Headlights flare at the end of the passage. A police vehicle turns in, alerted by the earlier emergency message and calls from nearby residents. The man bolts into the car. The officers pursue him while another officer pulls me behind cover.

I tell them where I hid the card. They retrieve it and take my statement. The suspect escapes that night, and I have to accept that my gamble put me in danger. But the evidence survives. At dawn, an investigator tells me the recording is being examined and the victim’s family has been notified. The case is not over. Neither is my part in it.`,
      choices: [],
    },
  ],
};

const seedCheck = validateInteractiveStory(THE_LAST_WITNESS);
if (!seedCheck.ok) {
  throw new Error(`The Last Witness story data is invalid:\n${seedCheck.errors.join("\n")}`);
}
