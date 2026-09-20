import type { InteractiveStory } from "./types";
import { validateInteractiveStory } from "./validate";

export const THE_WRONG_TRAIL_SLUG = "the-wrong-trail";
export const THE_WRONG_TRAIL_IMAGE_DIR = "/images/vibe/stories/the-wrong-trail";

function sceneImage(id: string) {
  return `${THE_WRONG_TRAIL_IMAGE_DIR}/${id}.webp`;
}

export const THE_WRONG_TRAIL: InteractiveStory = {
  id: THE_WRONG_TRAIL_SLUG,
  slug: THE_WRONG_TRAIL_SLUG,
  title: "The Wrong Trail",
  subtitle: "One Forest. Three Friends. No Way Back.",
  introduction:
    "I became separated from my friends during a camping trip in the forest. Every choice I make next could change my life. Start at Scene 01. At the end of each scene, choose A, B or C. Your choices lead to fourteen scenes and four possible endings.",
  coverImageUrl: `${THE_WRONG_TRAIL_IMAGE_DIR}/cover.webp`,
  coverImagePath: "",
  startSceneId: "01",
  published: true,
  scenes: [
    {
      id: "01",
      title: "The Wrong Trail",
      time: "4:42 PM",
      location: "The forest junction",
      imageUrl: sceneImage("01"),
      isEnding: false,
      text: `The four of us—Ryan, Noah, Jake and I, Ethan—entered the forest at about nine in the morning. At the small ranger checkpoint beside the parking area, we wrote our names in the register and noted that we would return before six. Ryan took the map. Noah slung the food bag over his shoulder. Jake led the way, and I followed with my camera in my hand.

It rained after lunch. Mud collected along the trail to the campsite we had chosen. With clouds overhead, the forest was already dark at four in the afternoon. When a brief shaft of sunlight broke through the trees, I stopped to take a photograph.

When I looked up from the camera screen, there was no one ahead of me. I had stopped for less than thirty seconds, yet I could no longer hear my friends’ footsteps.

“Ryan!” I shouted. No answer. A few steps farther on, the trail divided in two. We had not passed this junction before. In the mud on the right-hand path was a print that looked like the star-shaped tread on Ryan’s boot.

Then someone called from among the trees to my left. “Hurry up! We’re over here!” The voice sounded exactly like Ryan’s. I checked my phone. It was 4:42 PM. The battery was at nineteen percent. No signal.

Had my friends gone right? Then who was calling from the left? Darkness would come soon. I had to think before choosing.`,
      choices: [
        {
          id: "A",
          label: "Follow the voice down the left-hand trail",
          destinationId: "02",
        },
        {
          id: "B",
          label: "Take the right-hand trail marked by the boot prints",
          destinationId: "03",
        },
        {
          id: "C",
          label: "Mark my position and call to my friends again",
          destinationId: "04",
        },
      ],
    },
    {
      id: "02",
      title: "Following the Voice",
      time: "4:53 PM",
      location: "The left-hand trail",
      imageUrl: sceneImage("02"),
      isEnding: false,
      text: `“Ryan! Wait for me!” I turned onto the left-hand trail. My boots sank into the mud, and bushes brushed against my body. I could see no fresh footprints to suggest that anyone else had come this way.

“Can you hear me?” I called again. Nothing. Twenty steps farther on, the path ended at a huge fallen tree. There was room to squeeze through the bushes beyond it, but no clear trail.

In case I needed to return, I untied the red strip of cloth from my bag and fastened it to a nearby branch. At once the voice that sounded like Ryan’s called again: “Come this way!” It came from beyond the fallen tree.

My phone read 4:53 PM. Seventeen percent battery. Still no signal. Something silver glinted beneath the trunk. When I picked it up, I found a key tag engraved with Ryan’s name. I had seen it hanging from his bag that morning.

A twig snapped behind me. Between two trees along the path I had taken, I saw a dark shape that looked almost human. Before I could make it out, it disappeared among the trees. I could not tell whether it was a person or an animal.

I held the key tag in my hand. The red strip showed me the way back. But the voice from beyond the trunk kept drawing me onward.`,
      choices: [
        {
          id: "A",
          label: "Climb past the fallen tree and examine the broken branches",
          destinationId: "05",
        },
        {
          id: "B",
          label: "Follow the red cloth marker back to the junction, then take the right-hand trail",
          destinationId: "03",
        },
        {
          id: "C",
          label: "Follow the red cloth marker back and call to my friends",
          destinationId: "04",
        },
      ],
    },
    {
      id: "03",
      title: "Evidence in the Mud",
      time: "Around 4:55 PM",
      location: "The right-hand trail",
      imageUrl: sceneImage("03"),
      isEnding: false,
      text: `When I turned right at the junction, the star-shaped impressions in the mud became clearer. They matched Ryan’s boots, although another pair might have had the same tread. I could not be certain.

At one point, a heel had sunk deeply into the ground. Beside it was a dragged mark, as if someone had slipped. A blue thread hung from a bush. Ryan’s jacket was blue, too.

“Ryan,” I called softly. No reply came from the trees. Instead, I heard running water. The footprints led toward it.

I crouched and photographed two or three prints. Then I noticed a thin thread of smoke rising between the distant treetops. In a forest wet from rain, smoke might mean someone had lit a fire. I had no idea who.

I looked back to make sure I could still recognize the junction. The return path was clear. Ahead lay the sound of water; farther away, smoke; behind me, the way back. I had to choose.`,
      choices: [
        {
          id: "A",
          label: "Follow the footprints toward the sound of water",
          destinationId: "06",
        },
        {
          id: "B",
          label: "Head toward the rising smoke",
          destinationId: "09",
        },
        {
          id: "C",
          label: "Return to the junction",
          destinationId: "04",
        },
      ],
    },
    {
      id: "04",
      title: "An Answer in the Silence",
      time: "Around 5:00 PM",
      location: "The forest junction",
      imageUrl: sceneImage("04"),
      isEnding: false,
      text: `I returned to the junction. So I would not forget the route I had taken, I marked a tree trunk with a little mud. I set my bag down and steadied my breathing.

“Ryan! Noah! Jake!” I shouted all three names. At first I heard only birds. The second time, someone called faintly, “We’re… over here…” The voice echoed between the trees, making its direction impossible to identify.

I switched on my phone’s flashlight for a few seconds to inspect a trunk. A freshly carved arrow pointed toward stone steps hidden among the bushes. A little farther away, a scrap of yellow cloth hung from a branch. The rain cover on Noah’s bag was yellow, too.

I could not assume the same person had left both signs. I could hear water in the direction of the yellow cloth. The steps climbed uphill. There was also a relatively open patch of ground near the junction where I could stay.

I drew a breath and chose my next move instead of running after a guess.`,
      choices: [
        {
          id: "A",
          label: "Investigate the stone steps and carved arrow",
          destinationId: "07",
        },
        {
          id: "B",
          label: "Follow the direction of the yellow cloth",
          destinationId: "06",
        },
        {
          id: "C",
          label: "Stay somewhere safe and call for help",
          destinationId: "10",
        },
      ],
    },
    {
      id: "05",
      title: "Beyond the Fallen Tree",
      time: "Around 5:02 PM",
      location: "The fallen tree",
      imageUrl: sceneImage("05"),
      isEnding: false,
      text: `I put Ryan’s key tag in my pocket and climbed over the fallen trunk. The earth was wet. Beneath the broken branches, a long mark looked as though someone had slid through the soil.

“Help!” someone shouted from below. The voice sounded like Noah’s. I pushed aside the bushes. A few metres down the slope, someone sat beside a tree. I could not see his face.

“Noah? Is that you?”
“Yes! Don’t come straight down. The ground is slipping!”

Soil broke away beneath my boot. I barely stopped myself by grabbing a nearby root. Noah appeared to be hurt, but he could speak. A direct descent to him was dangerous.

I heard water to the right. Perhaps I could circle the slope and reach him. Or I could tell him to stay put while I looked for help on higher ground.

“I’ll stay here,” Noah said. “You be careful.”`,
      choices: [
        {
          id: "A",
          label: "Climb straight down to Noah using the tree roots",
          destinationId: "13",
        },
        {
          id: "B",
          label: "Find a safer route around the slope",
          destinationId: "08",
        },
        {
          id: "C",
          label: "Tell Noah to stay and seek help from higher ground",
          destinationId: "10",
        },
      ],
    },
    {
      id: "06",
      title: "At the Stream",
      time: "Around 5:12 PM",
      location: "The stream",
      imageUrl: sceneImage("06"),
      isEnding: false,
      text: `Following the muddy tracks or the direction indicated by the yellow cloth, I reached a small stream. The rain had made the water run hard. The surfaces of the stones shone with moisture.

On the opposite bank, I saw a yellow rain cover near the bushes. “Noah!” I shouted.

“Here! I’m here!” His voice was clear this time. He raised an arm between the bushes. “Don’t cross here. There’s a bridge a little upstream. But check it carefully!”

I looked up. Two planks were missing from the middle of the old wooden bridge. A post near the bank leaned sideways. It offered a shortcut, but it did not look safe.

Farther upstream, the water might narrow enough for a safer crossing. In the other direction, an old service track ran between the bushes. A weathered sign said it led to a ranger hut.

Noah watched me from the other bank. I wanted to reach him quickly, but if both of us were to survive, I needed to think carefully about that bridge.`,
      choices: [
        {
          id: "A",
          label: "Try the damaged bridge despite knowing the danger",
          destinationId: "14",
        },
        {
          id: "B",
          label: "Go upstream and look for a safe crossing",
          destinationId: "08",
        },
        {
          id: "C",
          label: "Follow the service track to find help",
          destinationId: "09",
        },
      ],
    },
    {
      id: "07",
      title: "The Stone Steps",
      time: "Around 5:15 PM",
      location: "The stone steps",
      imageUrl: sceneImage("07"),
      isEnding: false,
      text: `I followed the arrow carved into the tree and found stone steps hidden among the bushes. Rain had left them wet, so I tested each foothold as I climbed.

At the top, the trees thinned. I saw smoke in the distance and heard water below. Faded letters on a stone post read: RANGER TRACK. Its arrow pointed toward the smoke.

Lower down on the post, two words had been scratched recently in a different colour: DON’T FOLLOW. I did not know who had written them. They might warn that the ranger track was dangerous. Or someone might be trying to send me in another direction.

From the open ground above the steps, I might spot a flashlight or people moving in the distance. Following the smoke might lead me to the ranger hut.

I rested a hand against the post and took a breath. It was not dark yet, but I could not remain here without deciding.`,
      choices: [
        {
          id: "A",
          label: "Follow the Ranger Track sign toward the smoke",
          destinationId: "09",
        },
        {
          id: "B",
          label: "Call for help from the open high ground",
          destinationId: "10",
        },
      ],
    },
    {
      id: "08",
      title: "Noah’s Truth",
      time: "Around 5:30 PM",
      location: "Upstream crossing",
      imageUrl: sceneImage("08"),
      isEnding: false,
      text: `Instead of descending the slope directly or crossing the broken bridge, I went upstream. Where the water narrowed, I found several dry stones. Using a branch for support, I crossed carefully.

“Noah!” I called. He emerged from the bushes. Dried blood marked a wound on his left arm. He said he could walk, though the pain showed on his face.

“Where did you all go?” I asked.

“At the junction, we realized you weren’t behind us. I turned back, slipped in the mud and fell down the slope. Ryan and Jake went to find the ranger hut and told me to look for it too. I was the one calling you.”

“I heard Ryan’s voice from the left-hand path.”

Noah shook his head. “All three of us took the right-hand path. Ryan never went left.”

If I had taken the left path and found the key tag, I showed it to him. Otherwise, he was still surprised by what I told him. “Voices echo in this forest,” he said. “But I don’t know who was calling.”

I took a clean piece of cloth from my bag and helped him cover his injured arm. We could walk together. Now we had to decide whether to find the ranger hut or climb to higher ground and call for help.`,
      choices: [
        {
          id: "A",
          label: "Go with Noah to the ranger hut and call for help by radio",
          destinationId: "11",
        },
        {
          id: "B",
          label: "Go with Noah to higher ground and call for help",
          destinationId: "12",
        },
      ],
    },
    {
      id: "09",
      title: "Where the Smoke Rose",
      time: "Around 5:35 PM",
      location: "The ranger hut",
      imageUrl: sceneImage("09"),
      isEnding: false,
      text: `I followed the smoke to an old wooden hut. Part of its roof was broken, but fresh boot prints marked the wet earth by the entrance. I could hear two people talking inside.

“Ryan?” I called through the door. It opened. Ryan stood there, with Jake behind him. Both exhaled in relief when they saw me.

“Where did you go?” Ryan asked. I told him about the junction. They said Noah had become separated near the stream. If I had not already found him, that was the last place they knew him to be.

There was an old radio inside the hut. Jake examined it. The battery was weak, but for a moment a voice answered on the emergency channel.

Then footsteps sounded outside the front door. “Who’s in there?” asked an unfamiliar man. Ryan gripped my arm and whispered, “It felt as if someone was following us on the way here.”

The man might have come to help us, or he might have been the person following us. Several boards by the front entrance were broken, too; rushing out in the dark would be dangerous.

I moved closer to the door. Would I act alone this time, or make a plan with my friends?`,
      choices: [
        {
          id: "A",
          label: "Close the door and request help over the radio",
          destinationId: "11",
        },
        {
          id: "B",
          label: "Leave with Ryan and Jake through the back door",
          destinationId: "12",
        },
        {
          id: "C",
          label: "Speak through the door and confirm whether the stranger is a ranger",
          destinationId: "11",
        },
      ],
    },
    {
      id: "10",
      title: "One Last Attempt Before Dark",
      time: "Around 5:40 PM",
      location: "Open high ground",
      imageUrl: sceneImage("10"),
      isEnding: false,
      text: `Rather than keep guessing my way deeper into the forest, I found a nearby patch of open, elevated ground. I stayed close enough to the trail to recognize a tree marking my way back.

There was no signal on my phone. I switched off the screen to save what battery remained. I took a small sip of water from my bag and sat beside a dry rock instead of on the wet ground.

I heard people speaking in the distance. I did not run toward them. “Help! I’m over here!” I shouted.

“Stay where you are!” came a clear reply. A flashlight appeared between the trees and slowly approached.

I remembered the checkpoint where we had registered that morning. If we did not return by six, perhaps someone would come looking for us. But I still could not tell who was carrying that light.

I could stay and speak to the approaching person until I knew who they were. Or I could give in to fear, flee from the light and disappear into the dark bushes. My next choice mattered.`,
      choices: [
        {
          id: "A",
          label: "Stay where I am and speak to the people approaching with the light",
          destinationId: "12",
        },
        {
          id: "B",
          label: "Flee from the light and go alone into the forest",
          destinationId: "14",
        },
      ],
    },
    {
      id: "11",
      title: "Ending One — The Final Evidence",
      time: "6:20 PM",
      location: "The ranger hut",
      imageUrl: sceneImage("11"),
      isEnding: true,
      text: `We sent an emergency message over the radio. Ryan gave our names, the location of the ranger hut and the stream where Noah had gone missing. If I had arrived at the hut with Noah, we also explained his injury.

“Do not leave your location,” a voice replied. Some of the weight lifted from my shoulders. We shut the door, conserved our light and waited close together.

A few minutes later, a ranger team reached the hut. We learned that the unfamiliar voice outside the door had belonged to a ranger searching the old track for us. But he knew nothing about the voice like Ryan’s that I had heard on the left-hand path.

They found Noah near the stream if he had remained there. If he was already with us, they gave him first aid. Either way, all four of us eventually followed the ranger team to safety.

Before getting into the vehicle, I looked at the photograph I had taken near the junction. Between the distant trees was a dark shape resembling a human figure. I showed it to a ranger.

“Who is that?” he asked.
“I don’t know.”

It might have been the shadow of a tree. It might have been a person. We never learned whose voice I had heard. But that night, all four of us made it out of the forest.`,
      choices: [],
    },
    {
      id: "12",
      title: "Ending Two — A Light in the Night",
      time: "6:35 PM",
      location: "The forest road",
      imageUrl: sceneImage("12"),
      isEnding: true,
      text: `I stopped choosing dangerous routes on my own. If my friends were with me, I stayed with them. If I was alone on the high ground, I asked the people carrying the flashlight for their names and who they were.

“Forest rangers. Are you the group that registered this morning?” came the reply. When they recited our names from the checkpoint register, I knew who they were. If we had left the ranger hut by its back door, we met the same team along the service track.

They brought us together. They found Noah near the stream and gave him first aid; if he was already with me, a ranger checked his arm. They located Ryan and Jake, too. In the end, all four of us emerged safely.

The forest was completely dark when we reached the vehicle. Ryan put a hand on my shoulder. “I called out to you,” he said. “But from the right-hand path. I never went left.”

“Then who did I hear?” I asked.

Ryan did not answer. We climbed into the vehicle. Through the rear window, I looked back at the forest. A tiny light flashed among the trees, then went out.

I wanted to go back and investigate. But I let the thought go. Whatever remained unexplained in the forest, all four of us were alive.`,
      choices: [],
    },
    {
      id: "13",
      title: "Ending Three — Misplaced Trust",
      time: "Around 5:45 PM",
      location: "The slope",
      imageUrl: sceneImage("13"),
      isEnding: true,
      text: `Although Noah shouted, “Don’t come straight down,” I wanted to reach him quickly. Holding a tree root, I took my first step. As I placed my foot for the second, the wet soil gave way.

I tried to grip the root harder, but my hand slipped. My camera came loose from my shoulder and flew into the bushes. I fell down the slope.

“Grab hold!” Noah cried. He reached toward me, but the distance between us was too great. I struck a rock below.

The pain made it difficult even to breathe. Noah kept shouting my name. Injured himself, he could not pull me back up alone. He tried to call for help.

I remembered what Ryan had said when we entered the forest that morning: “Nobody goes off alone. If we see danger, we stop.”

By the time the search team arrived, it was too late. Noah survived. My camera was found caught in a bush higher up the slope.

Its final photograph showed a trail splitting in two. The path I chose had begun there. It ended here.`,
      choices: [],
    },
    {
      id: "14",
      title: "Ending Four — The Journey That Never Returned",
      time: "The following morning",
      location: "The shortcut",
      imageUrl: sceneImage("14"),
      isEnding: true,
      text: `I saw the danger ahead and chose the shortcut anyway. Whether it was the broken planks of the old bridge or the dark trail away from the light, I did not properly test the ground beneath my feet.

The first few steps went without trouble. On the next, wet wood or stone slipped beneath my boot. I lost my balance and fell. When I struck the rocky ground below, a terrible pain shot through my leg.

I tried to stand, but I could not put weight on it. “Help!” I shouted. For a moment, I heard a distant voice. I did not know whether anyone had heard me.

Darkness fell. I switched on my phone’s flashlight, trying to make my position visible. When the battery ran out, the screen went black. Only the water and the wind through the trees remained.

Because our names were in the checkpoint register, a search team was looking for me. They found me the following morning. By then, it was too late.

My three friends had reached safety. I might have returned with them. But in my hurry to finish the journey before dark, I had ignored the danger.`,
      choices: [],
    },
  ],
};

const seedCheck = validateInteractiveStory(THE_WRONG_TRAIL);
if (!seedCheck.ok) {
  throw new Error(`The Wrong Trail story data is invalid:\n${seedCheck.errors.join("\n")}`);
}
