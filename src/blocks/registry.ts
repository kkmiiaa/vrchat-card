import type { ComponentDef } from './types'
import { badgeComponent } from './badge'
import { booleanFlagComponent } from './booleanFlag'
import { ratingComponent } from './rating'
import { tagListComponent } from './tagList'
import { linkItemComponent } from './linkItem'
import { colorPaletteComponent } from './colorPalette'
import { dateItemComponent } from './dateItem'
import { languageComponent } from './language'
import { ageComponent } from './age'
import { colorStatusComponent } from './colorStatus'
import { colorLabeledListComponent } from './colorLabeledList'
import { dividerComponent } from './divider'
import { snsBundleComponent } from './snsBundle'
import { simpleSnsComponent } from './simpleSns'
import { activityComponent } from './activity'
import { markListComponent } from './markList'
import { galleryComponent } from './gallery'
import { backgroundComponent } from './background'
import { overlayComponent } from './overlay'
import { profileImageComponent } from './profileImage'
import { textComponent } from './text'
import { selectComponent } from './select'
import { multiSelectComponent } from './multiSelect'
import { gaugeComponent } from './gauge'
import { expressiveSelectComponent } from './expressiveSelect'
import { genderComponent } from './gender'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_REGISTRY: Record<string, ComponentDef<any>> = {
  [languageComponent.key]:          languageComponent,
  [ageComponent.key]:               ageComponent,
  [colorStatusComponent.key]:       colorStatusComponent,
  [colorLabeledListComponent.key]:  colorLabeledListComponent,
  [dividerComponent.key]:           dividerComponent,
  [snsBundleComponent.key]:         snsBundleComponent,
  [simpleSnsComponent.key]:         simpleSnsComponent,
  [activityComponent.key]:          activityComponent,
  [markListComponent.key]:          markListComponent,
  [galleryComponent.key]:           galleryComponent,
  [backgroundComponent.key]:        backgroundComponent,
  [overlayComponent.key]:           overlayComponent,
  [profileImageComponent.key]:      profileImageComponent,
  [badgeComponent.key]:             badgeComponent,
  [booleanFlagComponent.key]:       booleanFlagComponent,
  [ratingComponent.key]:            ratingComponent,
  [tagListComponent.key]:           tagListComponent,
  [linkItemComponent.key]:          linkItemComponent,
  [colorPaletteComponent.key]:      colorPaletteComponent,
  [dateItemComponent.key]:          dateItemComponent,
  [textComponent.key]:              textComponent,
  [selectComponent.key]:            selectComponent,
  [multiSelectComponent.key]:       multiSelectComponent,
  [gaugeComponent.key]:             gaugeComponent,
  [expressiveSelectComponent.key]:  expressiveSelectComponent,
  [genderComponent.key]:            genderComponent,
}

export function getComponent(blockKey: string): ComponentDef<unknown> | undefined {
  return COMPONENT_REGISTRY[blockKey]
}

export function getAllComponents(): ComponentDef<unknown>[] {
  return Object.values(COMPONENT_REGISTRY)
}
