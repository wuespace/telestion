# ADR-0009: Bootstrap for React Frontend

Date: 2024-01-06

## Status

Accepted

## Context
<!-- The issue that is motivating this decision and any context that influences or constrains the decision. -->

The `telestion-client-common` library was based on Adobe's [React Spectrum](https://react-spectrum.adobe.com/react-spectrum/index.html) library. This library was chosen because it was the only library that provided a complete set of components that were accessible and looked good.

In light of the decision to rewrite the `telestion-client` framework from scratch, it is a good time to evaluate the current choice of the component library.

Since the original framework was released, a number of CSS features have become reasonably well supported by modern browsers. Two of these features seem particularly promising for the Telestion frontend:

- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), which could allow for a more flexible theming system;
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/@container), which could allow widget instances to adapt to the size of their container.

With the additional feature of [CSS nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Nesting), it is more feasible than ever to write CSS for modern applications without abstracting it away using a CSS-in-JS approach.

Additionally, scoping can be achieved using CSS/SCSS modules in React, which is supported by most bundlers.

Compared to various vendor-specific CSS-in-JS solutions, the best-known solution to styling is (and remains) CSS. Its is therefore reasonable to hypothesize that a CSS-based approach to styling will be easier to understand and maintain than a CSS-in-JS approach.

React Spectrum uses a custom CSS-in-JS solution that does not play well with custom CSS. In fact, their documentation states that:

> *"While the traditional className and style props are not supported in React Spectrum components, there are two escape hatches that you can use at your own risk. These are UNSAFE_className and UNSAFE_style. Use of these props should be considered a last resort. They can be used to work around bugs or limitations in React Spectrum, but should not be used in the long term."* ([https://react-spectrum.adobe.com/react-spectrum/styling.html#css-functions, accessed January 6th, 2024](https://web.archive.org/web/20240106162811/https://react-spectrum.adobe.com/react-spectrum/styling.html#css-functions)).

While this makes sense in the context of React Spectrum being designed primarily for internal use at Adobe, it is means that it doesn't play well with custom CSS.

Using completely custom CSS for everything would create a lot of maintenance overhead, as it would require us to write a lot of CSS for components that were already provided by React Spectrum. In addition to the maintenance overhead, a custom component library would disallow application developers to use the components that they are already familiar with.

In light of this, a custom solution that plays well with CSS seems like the best option.

There are a number of libraries that provide a set of components that are accessible and look good. One of these libraries is [Bootstrap](https://getbootstrap.com/). Bootstrap is a well-known library that provides a set of components that are accessible and look good. It is also well-documented and has a large community.

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

Under careful consideration of these reasons, be it resolved that:

### Using Bootstrap for React Frontend

The `telestion` framework will use Bootstrap for its components and UI.

## Consequences
<!-- What becomes easier, or more difficult to do and any risks introduced by the change that will need to be mitigated? -->

### Improved Developer Experience

The new framework will be easier to understand and use.

### Better Maintanability

The new framework will be easier to maintain and extend.

### Old widgets based on React Spectrum

While in the long term, it is desirable to migrate all widgets to Bootstrap, it is not feasible to do so in the short term.

It should be possible to use React Spectrum widgets in the new framework. This will allow for a gradual migration of widgets to Bootstrap.
