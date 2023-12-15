# Writer's Guide

## Introduction

This guide is intended to help you write documentation.

## Writing Style

### General

* Use the active voice.
* Use the present tense.
* Use the second person.
* Use the imperative mood.
* Use they/them/their as singular pronouns.

## Markdown

### General

* Use the [GitHub Flavored Markdown](https://github.github.com/gfm/) syntax.
* Use the [CommonMark](https://commonmark.org/) specification.

### Headings

* Use `#` for headings.
* Use `##` for subheadings.
* Use `###` for sub-subheadings.

### Lists

* Use `*` for unordered lists.
* Use `1.` for ordered lists.
* Use `*` for nested unordered lists.
* Use `1.` for nested ordered lists.

### Links

* Use `[text](url)` for links.

#### Internal Links

* Use relative links for internal links.
* Use the `.md` extension for internal links.
* Use the `#` symbol for internal links to (sub-) headings.

!!! example
    ```markdown
    [Telestion Website](https://telestion.wuespace.de)
    
    [Deployment Pre-requisites](Deployment/prerequesites.md)
    
    [Deployment Pre-requisites](Deployment/prerequesites.md#deployment-pre-requisites)
    ```
    

### Images

* Use `![alt text](url)` for images.
* Write the alt text in sentence case.
* Place images close to the text that references them.
* Use the PNG format for images.
* Use the SVG format for logos and icons.
* Use the JPEG format for photographs.
* Use the GIF format for animations.

For images that can be inverted for the dark theme, use the following syntax:

```markdown
![alt text](url){ .invertible }
```

To add a caption to an image, use the following syntax:

```markdown
<figure markdown>
![alt text](url)
<figcaption>Image caption</figcaption>
</figure>
```

!!! example
    ```markdown
    ![alt text](url)

    ![alt text](url){ .invertible }

    <figure markdown>
    ![alt text](url)
    <figcaption>Image caption</figcaption>
    </figure>
    ```

### Code Blocks

* Use ` ``` ` for code blocks.
* Use ` ```language ` for code blocks with syntax highlighting.
* Use ` ```language title="name" ` for code blocks with syntax highlighting and a title.

!!! example
    ````markdown
    ```java
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
    ```

    ```java title="Hello World"
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
    ```
    ````

### Admonitions

* Use `!!! note` for notes.
* Use `!!! tip` for tips.
* Use `!!! warning` for warnings.
* Use `!!! danger` for dangers.
* Use `!!! example` for examples.
* Use `!!! question` for questions.

!!! example
    ````markdown
    !!! note
        This is a note.

    !!! tip
        This is a tip.

    !!! warning
        This is a warning.

    !!! danger
        This is a danger.

    !!! example
        This is an example.

    !!! question
        This is a question.
    ````

### Keyboard Shortcuts

* Use `++` for keyboard shortcuts.
* Use `++ctrl+f++` for keyboard shortcuts with multiple keys.
* Use lowercase letters for keyboard shortcuts.

!!! example
    Press ++ctrl+f++ to open the menu.

    ```markdown
    Press ++ctrl+f++ to open the menu.
    ```
