# Scroll Time: Shortcuts setup

Deadline Hub doesn't award TikTok/Instagram minutes directly &mdash; iOS doesn't let a
web app touch other apps. Instead, when you finish an assignment the app opens a URL
like `shortcuts://run-shortcut?name=Earn%20Minutes&input=text&text=15`, which hands
the number of minutes to a **Shortcut** you build once on your phone. That shortcut
keeps the real balance in a small text file in iCloud Drive, and two **Personal
Automations** read that balance when you open TikTok or Instagram.

Build these in this order: **1 &rarr; one-time balance file &rarr; 2 &rarr; 3 &rarr; 4.**
Everything below uses the stock **Shortcuts** app (already on your phone).

> Action names and the exact wording of toggles move around a little between iOS
> versions. If a step below doesn't match what you see, use the search bar at the
> top of the action picker and search for the bolded keyword &mdash; it'll be close by.

---

## 0. One-time: create the balance file

The shortcuts below read and write one shared file. Create it once by hand so every
shortcut can assume it already exists:

1. Open the **Files** app.
2. Tap **Browse** at the bottom, then **iCloud Drive**.
3. Tap **&hellip;** (or the three-dot menu) &rarr; **New Folder** &rarr; name it `Shortcuts`
   if a Shortcuts folder doesn't already exist there.
4. Open that **Shortcuts** folder.
5. Tap **&hellip;** &rarr; **Create Document** (on some iOS versions: tap the folder
   background, then the "+" / document icon) &rarr; choose a blank text file.
   If Files doesn't offer a plain text file directly, instead: open **Notes**, create
   a new note containing just `0`, then use the Share Sheet &rarr; **Save to Files** &rarr;
   iCloud Drive &rarr; Shortcuts, and rename it in the next step.
6. Name the file exactly `balance.txt` and make sure its only content is the single
   character `0`.
7. Repeat and create a second empty file in the same folder named `open_time.txt`
   (content doesn't matter yet &mdash; it gets overwritten the first time you open
   TikTok or Instagram after setup).

You now have `iCloud Drive/Shortcuts/balance.txt` and `.../open_time.txt`.

---

## 1. Shortcut: "Earn Minutes"

This is the shortcut Deadline Hub calls when you check off a deadline. It receives a
number of minutes and adds it to `balance.txt`.

1. Open **Shortcuts** &rarr; **My Shortcuts** tab &rarr; tap **+** (top right) to create a
   new shortcut.
2. Tap the name field at the top ("New Shortcut") and rename it exactly **Earn Minutes**
   (the app passes this name in the URL, so it must match).
3. Tap **Add Action**, search for **Get File**, and add it.
   - Tap the file glyph inside the action, browse to **iCloud Drive &rarr; Shortcuts**,
     and select **balance.txt**.
   - Tap the action to expand its options and turn **Show Document Picker** **off**,
     so it always silently uses this exact file.
4. Add action **Get Contents of File** (search "contents of file"). Shortcuts should
   auto-connect it to the file from step 3; if not, tap its input field and choose
   the file from step 3.
5. Add action **Number**. Tap its value field, and from the variable picker choose the
   output of **Get Contents of File** (this turns the saved text into a real number,
   call it "Balance").
6. Add action **Calculate**. Set the left side to the magic variable **Shortcut Input**
   (found under "Shortcut Input" in the variable picker &mdash; this is the number
   Deadline Hub sent), set the operator to **+**, and set the right side to the
   **Number** variable from step 5.
7. Add action **Save File** (search "save file").
   - Set its input to the result of **Calculate** from step 6.
   - Tap **Service** / the save location and choose **iCloud Drive**.
   - Set the path to **Shortcuts/balance.txt**.
   - Turn **Overwrite If File Exists** / "Ask Where to Save" settings so that it
     **overwrites** the existing file rather than creating "balance 2.txt". (Exact
     wording varies by iOS version &mdash; the important toggle is the one that stops
     it from prompting you or duplicating the file.)
8. Optional but nice: add a **Show Notification** action above the Save File step (or
   after it) with text like "Added minutes to your balance" so you get quiet
   confirmation it worked.
9. Tap **Done**.

Test it: in Shortcuts, tap **Earn Minutes** to run it manually &mdash; since there's no
"Shortcut Input" when run this way, it'll add 0 (or show an error, which is fine).
The real test is from Deadline Hub itself: mark a deadline done and watch for the
notification, then check `balance.txt` in Files to confirm the number went up.

---

## 2. Shortcut: "Show Balance"

1. Create a new shortcut named exactly **Show Balance**.
2. Add **Get File** &rarr; select `balance.txt` &rarr; turn off **Show Document Picker**
   (same as step 3 above).
3. Add **Get Contents of File**.
4. Add action **Text**, and build a sentence like:
   `You have [Contents of File] minutes of scroll time.`
   (Type the fixed words, then insert the magic variable from step 3 in the middle.)
5. Add action **Show Result** (or **Show Notification**, whichever you prefer) with
   the Text from step 4 as its input.
6. Tap **Done**.

This is the shortcut the Scroll Time tab's "Check balance" button runs.

---

## 3. Personal Automation: "When TikTok or Instagram is opened"

1. In Shortcuts, go to the **Automation** tab &rarr; tap **+** &rarr; **Create Personal
   Automation**.
2. Scroll down to **App**, tap it.
3. Tap **Choose** next to **Is Opened**, then select **TikTok** and **Instagram**
   (if your iOS version only lets you pick one app per automation, build this whole
   automation twice &mdash; once for each app &mdash; with identical actions).
4. Tap **Next**.
5. Add the actions, in order:
   1. **Get File** &rarr; `balance.txt` &rarr; Show Document Picker off.
   2. **Get Contents of File**.
   3. **Number** &rarr; value = the contents from the previous step. Call this "Balance".
   4. **If** &rarr; Condition: **Balance** &rarr; **is less than or equal to** &rarr; `0`.
   5. Inside the **If** (true) branch:
      - **Show Notification** &rarr; Title "Deadline Hub", Body
        `0 minutes. Finish an assignment first.`
      - **Go to Home Screen** (search "home screen" &mdash; this backs out of the app).
   6. Tap **Otherwise** to add the else branch:
      - **Current Date**.
      - **Format Date** &rarr; Date Format: **Custom** &rarr; format string
        `yyyy-MM-dd HH:mm:ss` (this turns "now" into a clean, sortable timestamp).
      - **Save File** &rarr; input = the formatted date above &rarr; iCloud Drive &rarr;
        path `Shortcuts/open_time.txt` &rarr; overwrite on (same settings as the
        balance file).
      - **Start Timer** (search "timer") &rarr; set the duration to the **Balance**
        number from step 5.3, unit **Minutes**. Leave the sound on so you get an
        alert when your time is up.
   7. Tap **End If** is automatic; just make sure both branches are filled in as above.
6. Tap **Next**.
7. Turn **Ask Before Running** **off** (you want this labeled "Run Immediately" /
   silent). iOS may still show a one-time system prompt the very first time a
   personal automation runs certain actions (like Save File or Start Timer) in the
   background &mdash; approve it once and it won't ask again.
8. Tap **Done**.

---

## 4. Personal Automation: "When TikTok or Instagram is closed"

1. Automation tab &rarr; **+** &rarr; **Create Personal Automation** &rarr; **App** &rarr;
   **Is Closed** &rarr; select **TikTok** and **Instagram** (again, two automations if
   your iOS only allows one app each).
2. Actions, in order:
   1. **Get File** &rarr; `open_time.txt` &rarr; Show Document Picker off.
   2. **Get Contents of File**.
   3. **Get Dates from Input** (search "dates from input") &rarr; input = the text from
      step above. This turns the saved timestamp text back into a real Date value.
   4. **Current Date**.
   5. **Calculate** &rarr; left side = **Current Date**, operator **&minus;**, right side =
      the Date from step 3. This gives you the elapsed time in seconds.
   6. **Calculate** again &rarr; take the result above, operator **&divide;**, value `60`,
      to convert seconds to minutes.
   7. **Round Number** &rarr; round the result down (**Floor**) to a whole number of
      minutes elapsed.
   8. **Get File** &rarr; `balance.txt` &rarr; **Get Contents of File** &rarr; **Number**
      (call this "Balance", same as before).
   9. **Calculate** &rarr; **Balance** minus the elapsed minutes from step 7.
   10. **If** &rarr; that result &rarr; **is less than** &rarr; `0`:
       - True: **Number** action with value `0` (clamp to zero).
       - Otherwise: just pass the Calculate result through.
   11. **Save File** &rarr; the clamped number &rarr; iCloud Drive &rarr;
       `Shortcuts/balance.txt` &rarr; overwrite on.
3. Tap **Next** &rarr; turn **Ask Before Running** off &rarr; **Done**.

---

## Known iOS limitations (read before you rely on this)

- **A home-screen web app can't be reopened by a shortcut.** There's no Shortcuts
  action that can bring a specific installed PWA back to the foreground &mdash; "Open
  App" only works for apps from the App Store. After `shortcuts://run-shortcut...`
  runs, you'll need to swipe back to Deadline Hub yourself. This is a hard iOS
  restriction, not something fixable in the shortcut.
- **Personal Automations can run with a short delay**, and historically iOS has
  sometimes shown a one-off confirmation banner the first few times an automation
  runs certain actions silently, even with "Ask Before Running" off. This is normal.
- **The elapsed-time math in step 4 is approximate**, not to-the-second, since it
  depends on exactly when iOS fires the "Is Opened"/"Is Closed" triggers.
- **Running a shortcut from `shortcuts://run-shortcut...` inside a standalone PWA**
  briefly hands control to the Shortcuts app (or shows a system confirmation) before
  returning you to Safari/your home screen app. Behavior here has changed across iOS
  versions, so test it once after setup to see exactly what you get on your phone.
- If any action name above doesn't exist verbatim on your iOS version, search the
  action picker for the bolded keyword in that step &mdash; the equivalent action is
  almost always one search away.
