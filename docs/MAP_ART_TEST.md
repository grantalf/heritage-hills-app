# Paper map: image tool test

2026-11-17. The founder chose the image tool route for the paper map's artwork (D-075). This records a small test of it.

## What was done
- Tool: Figma's built-in image maker, through the Figma connection, in a new file in the founder's Figma account: "Heritage Hills paper map - image tool test" (https://www.figma.com/design/pr7PDxUUGfihUqaI6f7O1T).
- Four pictures, all described in words only. **No reference picture and no photo was given to the tool** (D-060). No names or text were asked for.
- Small previews of all four: `docs/art/map-image-test-previews.png`.

| # | Asked for | Model |
|---|---|---|
| 1 | One corner (creek, bridge, garden, roads, scrub), watercolor storybook style | gpt-image-2.5-flare |
| 2 | The same corner, pen and ink with pale washes, novel-map style | gemini-3.1-flash-image |
| 3 | The whole neighborhood, with the road layout described in words | gpt-image-2.5-flare |
| 4 | A sheet of 24 separate pieces on a plain background: six trees, plants, the bridge, the garden, the Triceratops sculpture, the school, a signpost, a compass, a scroll, critters, a badge | gpt-image-2.5-flare |

## What we learned
1. **The look is far better than drawing by code.** Every tree and plant is its own small painting, with ink lines and soft color, close to the founder's references. Picture 1 is nearest the watercolor children's-book map. Picture 2 is nearest the pen-and-ink novel map.
2. **The tool cannot follow the real road layout.** In picture 3 it drew its own grid of roads, not the founder's sketch. So the tool must not paint the whole map in one picture.
3. **Separate pieces work well.** Picture 4 came out clean, in one matching style, on a flat background that code can remove. These pieces can be placed by code on the real layout.
4. **The roads are the weak spot.** Roads have to match the travel paths exactly, so code draws them. They need a hand-inked texture so they don't look flat next to the painted pieces. Not tried yet.
5. **Pictures made at different times may not match.** Make all pieces in a few sheets, with the same wording and the same model.

## What blocks the next step
**The full-size pictures cannot reach Claude's workspace.** Its network does not allow figma.com, so only small 256-pixel previews came through. Figma's download links for these four pictures expire about 2026-11-24. One of these is needed:
- **The founder exports them.** In the Figma file, select each picture and choose Export > PNG. Then add the PNGs to the Claude Project's files. This works on any plan.
- **Or allow the site.** Add `www.figma.com` to the allowed sites under claude.ai Settings > Capabilities. This is only possible on a paid individual plan; on a Team or Enterprise plan an admin does it.

## Next test, once the full-size pieces are in
1. Code draws the paper, the creek band and the roads from the sketch, with an inked texture.
2. Code cuts out the pieces from picture 4 and places them: trees between the roads, landmarks at their real places, the border and the badges.
3. Real-text labels go on top, as in the block 1 sample.
4. Show the founder the result next to picture 1 or 2. If the roads look out of place, try the second way: give the tool **our own** layout drawing (roads only, made by code) and ask it to repaint it in the chosen style. That needs Figma's Weave tool, which spends Weave credits and needs the founder's OK for each run.

## Still open
- **Cost.** Figma AI credits come from the founder's Figma plan (Starter, View seat). The tool does not report how many these four used. Check in Figma's billing page.
- **Who owns the pictures and how they may be used.** Check Figma's AI terms before shipping any of them in the app. Add to the attorney list.
- **The Triceratops piece** is the tool's own drawing from words. It must not be made to look like the real sculpture without the artist's or owner's blessing (D-062).
